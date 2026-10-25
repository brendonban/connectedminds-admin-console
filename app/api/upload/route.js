import { NextResponse } from "next/server";
import crypto from "crypto";
import { isAuthed } from "../../../lib/session";
import { ensureDraftBranch, putFile, sitePath, DRAFT_BRANCH } from "../../../lib/github";

const ALLOWED_FOLDERS = new Set(["team", "location", "posters"]);
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf"]);

function safeExt(filename) {
  const match = /\.[a-z0-9]+$/i.exec(filename || "");
  const ext = (match ? match[0] : "").toLowerCase();
  return ALLOWED_EXT.has(ext) ? ext : ".jpg";
}

function slugify(name) {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40) || "photo"
  );
}

export async function POST(request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");
  const folder = form.get("folder");
  const label = form.get("label") || "";

  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }
  if (!ALLOWED_FOLDERS.has(folder)) {
    return NextResponse.json({ error: "Invalid upload folder" }, { status: 400 });
  }
  // Vercel's serverless functions cap request bodies at roughly 4.5MB, so a
  // bigger file would fail with an opaque platform-level error before this
  // code even runs — stay safely under that and give a clear message.
  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File is too large (max 4MB) — try compressing it first." },
      { status: 400 }
    );
  }

  const ext = safeExt(file.name);
  const filename = `${slugify(label || file.name)}-${crypto
    .randomBytes(4)
    .toString("hex")}${ext}`;
  const filePath = sitePath(`public/images/${folder}/${filename}`);

  try {
    await ensureDraftBranch();
    const buffer = Buffer.from(await file.arrayBuffer());
    await putFile({
      filePath,
      content: buffer,
      message: `Add file: ${label || filename}`,
      branch: DRAFT_BRANCH,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ path: `/images/${folder}/${filename}` });
}
