"use client";

import { useState } from "react";
import { useContentEditor } from "../../components/use-content-editor";
import {
  Field,
  TextAreaField,
  Card,
  RemoveButton,
  AddButton,
} from "../../components/form-fields";
import { SaveBar } from "../../components/save-bar";

function slugify(title) {
  return (title || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const EMPTY_POST = {
  slug: "",
  year: String(new Date().getFullYear()),
  title: "",
  date: "",
  publishedDate: "",
  externalHref: "",
  body: "",
  author: { name: "", role: "", bio: "" },
  references: [],
};

export function ReadingListEditor() {
  const { data, setData, loading, saving, error, savedAt, save } =
    useContentEditor("reading-list");
  const [touchedSlugs, setTouchedSlugs] = useState(() => new Set());

  if (loading) return <p className="text-muted">Loading…</p>;
  if (!data) return <p className="text-danger">{error || "Failed to load."}</p>;

  const posts = data.posts || [];

  function updatePost(i, patch) {
    setData({ ...data, posts: posts.map((p, idx) => (idx === i ? { ...p, ...patch } : p)) });
  }

  function updatePostAuthor(i, patch) {
    updatePost(i, { author: { ...posts[i].author, ...patch } });
  }

  function removePost(i) {
    setData({ ...data, posts: posts.filter((_, idx) => idx !== i) });
  }

  function addPost() {
    setData({ ...data, posts: [...posts, { ...EMPTY_POST, author: { ...EMPTY_POST.author }, references: [] }] });
  }

  function handleTitleChange(i, title) {
    const patch = { title };
    // Auto-fill the slug from the title until the user edits the slug by hand.
    if (!touchedSlugs.has(i)) {
      patch.slug = slugify(title);
    }
    updatePost(i, patch);
  }

  function handleSlugChange(i, slug) {
    setTouchedSlugs((prev) => new Set(prev).add(i));
    updatePost(i, { slug: slugify(slug) });
  }

  function updateReference(i, ri, patch) {
    const refs = [...(posts[i].references || [])];
    refs[ri] = { ...refs[ri], ...patch };
    updatePost(i, { references: refs });
  }
  function removeReference(i, ri) {
    updatePost(i, { references: (posts[i].references || []).filter((_, idx) => idx !== ri) });
  }
  function addReference(i) {
    updatePost(i, { references: [...(posts[i].references || []), { text: "", href: "" }] });
  }

  return (
    <div>
      <div className="grid gap-6">
        {posts.map((post, i) => (
          <Card key={i}>
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-bold text-lg">{post.title || "New post"}</h3>
              <RemoveButton onClick={() => removePost(i)} label="Delete post" />
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Year" value={post.year} onChange={(v) => updatePost(i, { year: v })} placeholder="2026" />
              <Field label="Date (shown in list)" value={post.date} onChange={(v) => updatePost(i, { date: v })} placeholder="Feb 23" />
              <Field
                label="Title"
                value={post.title}
                onChange={(v) => handleTitleChange(i, v)}
                className="sm:col-span-2"
              />
              <Field
                label="Published date (shown on the post)"
                value={post.publishedDate}
                onChange={(v) => updatePost(i, { publishedDate: v })}
                placeholder="Feb 23, 2026"
                className="sm:col-span-2"
              />
            </div>

            <Field
              label="URL slug (used in the post's address)"
              value={post.slug}
              onChange={(v) => handleSlugChange(i, v)}
              placeholder="what-is-cognitive-ageing"
            />
            <p className="text-muted text-xs -mt-2">
              This post will live at /reading-list/{post.slug || "your-slug"}/
            </p>

            <Field
              label="Or link out to an external URL instead (leave blank to write the post here)"
              value={post.externalHref}
              onChange={(v) => updatePost(i, { externalHref: v })}
              placeholder="https://..."
            />

            <TextAreaField
              label="Body (Markdown — ## heading, ### subheading, **bold**, *italic*, blank line between paragraphs)"
              value={post.body}
              onChange={(v) => updatePost(i, { body: v })}
              rows={14}
            />

            <div className="grid gap-2">
              <span className="text-sm font-medium text-muted">References (optional)</span>
              {(post.references || []).map((r, ri) => (
                <div key={ri} className="flex items-start gap-2">
                  <div className="grid gap-2 flex-1">
                    <input
                      type="text"
                      value={r.text}
                      onChange={(e) => updateReference(i, ri, { text: e.target.value })}
                      placeholder="Citation text"
                      className="rounded-lg border border-divider px-3 py-2 w-full outline-none focus:border-accent-primary bg-transparent"
                    />
                    <input
                      type="text"
                      value={r.href}
                      onChange={(e) => updateReference(i, ri, { href: e.target.value })}
                      placeholder="https://..."
                      className="rounded-lg border border-divider px-3 py-2 w-full outline-none focus:border-accent-primary bg-transparent"
                    />
                  </div>
                  <RemoveButton onClick={() => removeReference(i, ri)} />
                </div>
              ))}
              <AddButton onClick={() => addReference(i)} label="+ Add reference" />
            </div>

            <div className="grid gap-3">
              <span className="text-sm font-medium text-muted">Author (optional)</span>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field
                  label="Name"
                  value={post.author?.name}
                  onChange={(v) => updatePostAuthor(i, { name: v })}
                />
                <Field
                  label="Role"
                  value={post.author?.role}
                  onChange={(v) => updatePostAuthor(i, { role: v })}
                />
              </div>
              <TextAreaField
                label="Bio"
                value={post.author?.bio}
                onChange={(v) => updatePostAuthor(i, { bio: v })}
                rows={2}
              />
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-3">
        <AddButton onClick={addPost} label="+ Add new post" />
      </div>
      <SaveBar saving={saving} error={error} savedAt={savedAt} onSave={save} />
    </div>
  );
}
