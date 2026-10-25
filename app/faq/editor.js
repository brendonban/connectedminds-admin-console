"use client";

import { useContentEditor } from "../../components/use-content-editor";
import {
  Field,
  TextAreaField,
  Card,
  RemoveButton,
  AddButton,
} from "../../components/form-fields";
import { SaveBar } from "../../components/save-bar";

const EMPTY_ITEM = { q: "", a: "" };

export function FaqEditor() {
  const { data, setData, loading, saving, error, savedAt, save } =
    useContentEditor("faq");

  if (loading) return <p className="text-muted">Loading…</p>;
  if (!data) return <p className="text-danger">{error || "Failed to load."}</p>;

  const items = data.items || [];

  function set(patch) {
    setData({ ...data, ...patch });
  }

  function updateItem(i, patch) {
    set({ items: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  }
  function removeItem(i) {
    set({ items: items.filter((_, idx) => idx !== i) });
  }
  function addItem() {
    set({ items: [...items, { ...EMPTY_ITEM }] });
  }

  return (
    <div className="grid gap-6">
      <Field label="Page title" value={data.title} onChange={(v) => set({ title: v })} />
      <TextAreaField label="Intro (optional)" value={data.intro} onChange={(v) => set({ intro: v })} rows={2} />

      <div className="grid gap-4">
        {items.map((item, i) => (
          <Card key={i}>
            <div className="flex items-start justify-between gap-4">
              <div className="grid gap-2 flex-1">
                <Field label="Question" value={item.q} onChange={(v) => updateItem(i, { q: v })} />
                <TextAreaField label="Answer" value={item.a} onChange={(v) => updateItem(i, { a: v })} rows={3} />
              </div>
              <RemoveButton onClick={() => removeItem(i)} />
            </div>
          </Card>
        ))}
        <AddButton onClick={addItem} label="+ Add question" />
      </div>

      <SaveBar saving={saving} error={error} savedAt={savedAt} onSave={save} />
    </div>
  );
}
