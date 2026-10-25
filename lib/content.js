// Content now lives in the site's GitHub repo rather than a sibling folder
// on disk — see lib/github.js for why (this app runs as Vercel serverless
// functions, which have no persistent filesystem or local git).

import { ensureDraftBranch, getFileText, putFile, sitePath, DRAFT_BRANCH } from "./github";

export const CONTENT_TYPES = [
  "reading-list",
  "team",
  "internship-collaboration",
  "get-involved",
  "location",
  "faq",
];

function contentPath(type) {
  if (!CONTENT_TYPES.includes(type)) {
    throw new Error(`Unknown content type: ${type}`);
  }
  return sitePath(`content/${type}.json`);
}

// Reads always come from the draft branch, so editors see the latest saved
// (but not-yet-published) state — including anyone else's in-progress edits.
export async function readContent(type) {
  await ensureDraftBranch();
  const { text } = await getFileText(contentPath(type), DRAFT_BRANCH);
  return JSON.parse(text);
}

export async function writeContent(type, data) {
  await ensureDraftBranch();
  const filePath = contentPath(type);
  const { sha } = await getFileText(filePath, DRAFT_BRANCH);
  const json = JSON.stringify(data, null, 2) + "\n";
  await putFile({
    filePath,
    content: json,
    message: `Update ${type} content via admin console`,
    branch: DRAFT_BRANCH,
    sha,
  });
}
