import { NextResponse } from "next/server";
import { readContent, writeContent, CONTENT_TYPES } from "../../../../lib/content";
import { isAuthed } from "../../../../lib/session";

export async function GET(request, context) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { type } = await context.params;
  if (!CONTENT_TYPES.includes(type)) {
    return NextResponse.json({ error: `Unknown content type: ${type}` }, { status: 404 });
  }
  try {
    const data = await readContent(type);
    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request, context) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { type } = await context.params;
  if (!CONTENT_TYPES.includes(type)) {
    return NextResponse.json({ error: `Unknown content type: ${type}` }, { status: 404 });
  }
  try {
    const body = await request.json();
    await writeContent(type, body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
