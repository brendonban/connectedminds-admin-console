// Thin wrapper around the GitHub REST API. This is what lets the admin
// console run as ordinary Vercel serverless functions with no local
// filesystem or git binary: every read/write happens against the site's
// GitHub repo instead of a sibling folder on disk.
//
// Edits are committed to a "draft" branch (GITHUB_DRAFT_BRANCH, default
// "cms-draft") so multiple people can save work-in-progress without it
// going live immediately. The Publish page merges that branch into the
// live branch (GITHUB_MAIN_BRANCH, default "main") on demand — merging
// pushes new commits to main, which is what triggers Vercel's auto-deploy
// for the public site's own project.
//
// Required environment variables (set these in the admin console's
// Vercel project, see README.md):
//   GITHUB_TOKEN  - a token with read/write access to the site repo
//   GITHUB_OWNER  - the repo owner, e.g. "your-github-username"
//   GITHUB_REPO   - the repo name, e.g. "lab-website-next"
// Optional:
//   GITHUB_MAIN_BRANCH  - defaults to "main"
//   GITHUB_DRAFT_BRANCH - defaults to "cms-draft"

const API = "https://api.github.com";

export const MAIN_BRANCH = process.env.GITHUB_MAIN_BRANCH || "main";
export const DRAFT_BRANCH = process.env.GITHUB_DRAFT_BRANCH || "cms-draft";

// Optional: set this if the site's files sit inside a subfolder of the repo
// instead of at its root (e.g. a repo that has lab-website-next/content/...
// rather than content/... at the top level — this happens when the whole
// project folder gets dragged into GitHub's upload UI instead of just its
// contents). Leave unset if content/ and public/ are already at repo root.
export const SITE_ROOT = (process.env.GITHUB_SITE_ROOT || "").replace(/^\/+|\/+$/g, "");

export function sitePath(relativePath) {
  return SITE_ROOT ? `${SITE_ROOT}/${relativePath}` : relativePath;
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. Set it in the admin ` +
        `console's hosting dashboard (see README.md).`
    );
  }
  return value;
}

function repoInfo() {
  return {
    owner: requireEnv("GITHUB_OWNER"),
    repo: requireEnv("GITHUB_REPO"),
    token: requireEnv("GITHUB_TOKEN"),
  };
}

function encodePath(filePath) {
  return filePath.split("/").map(encodeURIComponent).join("/");
}

async function gh(path, options = {}) {
  const { token } = repoInfo();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body.message || JSON.stringify(body);
    } catch {
      detail = await res.text().catch(() => "");
    }
    const err = new Error(
      `GitHub API ${options.method || "GET"} ${path} failed (${res.status}): ${detail}`
    );
    err.status = res.status;
    throw err;
  }

  if (res.status === 204) return null;
  return res.json();
}

// --- branches ---

export async function getRefSha(branch) {
  const { owner, repo } = repoInfo();
  const data = await gh(
    `/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`
  );
  return data.object.sha;
}

// Creates the draft branch from the tip of main if it doesn't exist yet.
// Safe to call before every read/write — a no-op once the branch exists.
export async function ensureDraftBranch() {
  const { owner, repo } = repoInfo();
  try {
    return await getRefSha(DRAFT_BRANCH);
  } catch (err) {
    if (err.status !== 404) throw err;
  }
  const mainSha = await getRefSha(MAIN_BRANCH);
  await gh(`/repos/${owner}/${repo}/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${DRAFT_BRANCH}`, sha: mainSha }),
  });
  return mainSha;
}

// After a successful publish (merge into main), snap the draft branch back
// to main's new tip so the next round of edits starts clean instead of
// accumulating an ever-longer diff of already-published commits.
export async function resetDraftBranchToMain() {
  const { owner, repo } = repoInfo();
  const mainSha = await getRefSha(MAIN_BRANCH);
  await gh(`/repos/${owner}/${repo}/git/refs/heads/${encodeURIComponent(DRAFT_BRANCH)}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: mainSha, force: true }),
  });
}

export async function compareBranches(base, head) {
  const { owner, repo } = repoInfo();
  return gh(
    `/repos/${owner}/${repo}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`
  );
}

export async function mergeDraftIntoMain(commitMessage) {
  const { owner, repo } = repoInfo();
  return gh(`/repos/${owner}/${repo}/merges`, {
    method: "POST",
    body: JSON.stringify({
      base: MAIN_BRANCH,
      head: DRAFT_BRANCH,
      commit_message: commitMessage,
    }),
  });
}

export async function listRecentCommits(branch, perPage = 6) {
  const { owner, repo } = repoInfo();
  return gh(
    `/repos/${owner}/${repo}/commits?sha=${encodeURIComponent(branch)}&per_page=${perPage}`
  );
}

// --- file contents ---

async function ghRawBytes(path) {
  const { token } = repoInfo();
  const res = await fetch(`${API}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.raw",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const err = new Error(`GitHub API GET ${path} (raw) failed (${res.status}): ${detail}`);
    err.status = res.status;
    throw err;
  }
  return Buffer.from(await res.arrayBuffer());
}

export async function getFileRaw(filePath, ref) {
  const { owner, repo } = repoInfo();
  const path = `/repos/${owner}/${repo}/contents/${encodePath(filePath)}?ref=${encodeURIComponent(ref)}`;
  const data = await gh(path);
  if (Array.isArray(data)) {
    throw new Error(`${filePath} is a directory, not a file`);
  }
  if (data.content) {
    const buffer = Buffer.from(data.content, data.encoding || "base64");
    return { buffer, sha: data.sha };
  }
  // GitHub's Contents API only inlines base64 content for files up to ~1MB;
  // larger files (still returned up to 100MB) omit `content` but keep
  // `sha`/metadata. Fetch the bytes separately with a raw Accept header,
  // which isn't subject to that inline-JSON cap.
  const buffer = await ghRawBytes(path);
  return { buffer, sha: data.sha };
}

export async function getFileText(filePath, ref) {
  const { buffer, sha } = await getFileRaw(filePath, ref);
  return { text: buffer.toString("utf-8"), sha };
}

// sha: pass the current file's sha to update it, or omit to create a new
// file. GitHub's Contents API requires the sha of the file being replaced,
// so callers updating an existing file must fetch it first.
export async function putFile({ filePath, content, message, branch, sha }) {
  const { owner, repo } = repoInfo();
  const base64 = Buffer.isBuffer(content)
    ? content.toString("base64")
    : Buffer.from(content, "utf-8").toString("base64");
  const body = { message, content: base64, branch };
  if (sha) body.sha = sha;
  return gh(`/repos/${owner}/${repo}/contents/${encodePath(filePath)}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}
