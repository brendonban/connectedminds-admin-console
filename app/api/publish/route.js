import { NextResponse } from "next/server";
import { isAuthed } from "../../../lib/session";
import {
  ensureDraftBranch,
  compareBranches,
  mergeDraftIntoMain,
  resetDraftBranchToMain,
  listRecentCommits,
  MAIN_BRANCH,
  DRAFT_BRANCH,
} from "../../../lib/github";

// Status: are there saved-but-unpublished changes, and what does recent
// publish history look like? The Publish page loads this on mount.
export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await ensureDraftBranch();
    const diff = await compareBranches(MAIN_BRANCH, DRAFT_BRANCH);
    const recent = await listRecentCommits(MAIN_BRANCH, 6);
    return NextResponse.json({
      pending: diff.ahead_by > 0,
      filesChanged: (diff.files || []).map((f) => f.filename),
      recentCommits: recent.map((c) => ({
        sha: c.sha.slice(0, 7),
        message: (c.commit.message || "").split("\n")[0],
        date: c.commit.author?.date,
        url: c.html_url,
      })),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Publish: merge the draft branch (everything saved via the editors, plus
// any uploaded photos) into the live branch. GitHub records this as a real
// push to main, which is what triggers Vercel's auto-deploy for the public
// site's own project — no separate "push" step needed on this side.
export async function POST(request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const message =
    (body.message && String(body.message).trim()) ||
    "Publish content changes via admin console";

  try {
    await ensureDraftBranch();

    const diff = await compareBranches(MAIN_BRANCH, DRAFT_BRANCH);
    if (!diff.ahead_by) {
      return NextResponse.json({
        ok: true,
        nothingToPublish: true,
      });
    }

    const merge = await mergeDraftIntoMain(message);
    await resetDraftBranchToMain();

    return NextResponse.json({
      ok: true,
      nothingToPublish: false,
      commitSha: merge.sha ? merge.sha.slice(0, 7) : undefined,
      commitUrl: merge.html_url,
      filesChanged: (diff.files || []).map((f) => f.filename),
    });
  } catch (err) {
    if (err.status === 409) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Publish conflict: the live branch changed in a way this couldn't " +
            "merge automatically (unusual — only happens if someone pushed to " +
            "the repo directly, outside the admin console). It needs to be " +
            "resolved on GitHub directly.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { ok: false, error: err.message || "Publish failed" },
      { status: 500 }
    );
  }
}
