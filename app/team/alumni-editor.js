"use client";

import { Field, Card, RemoveButton, AddButton } from "../../components/form-fields";

const EMPTY_ALUM = {
  name: "",
  href: "",
  role: "",
  focus: "",
  years: "",
  now: "",
  nowHref: "",
};

export function AlumniEditor({ alumni, onChange }) {
  const list = alumni || [];

  function update(i, patch) {
    onChange(list.map((a, idx) => (idx === i ? { ...a, ...patch } : a)));
  }

  function remove(i) {
    onChange(list.filter((_, idx) => idx !== i));
  }

  function add() {
    onChange([...list, { ...EMPTY_ALUM }]);
  }

  return (
    <div className="grid gap-4">
      {list.map((a, i) => (
        <Card key={i}>
          <div className="flex items-start justify-between gap-4">
            <div className="grid sm:grid-cols-2 gap-3 flex-1">
              <Field label="Name" value={a.name} onChange={(v) => update(i, { name: v })} />
              <Field
                label="Link (optional)"
                value={a.href}
                onChange={(v) => update(i, { href: v })}
                placeholder="https://..."
              />
              <Field label="Role" value={a.role} onChange={(v) => update(i, { role: v })} placeholder="Research assistant" />
              <Field label="Years" value={a.years} onChange={(v) => update(i, { years: v })} placeholder="2022-2024" />
              <Field
                label="Focus (optional)"
                value={a.focus}
                onChange={(v) => update(i, { focus: v })}
                placeholder="what they worked on"
                className="sm:col-span-2"
              />
              <Field
                label="Now at (optional)"
                value={a.now}
                onChange={(v) => update(i, { now: v })}
              />
              <Field
                label="Now link (optional)"
                value={a.nowHref}
                onChange={(v) => update(i, { nowHref: v })}
                placeholder="https://..."
              />
            </div>
            <RemoveButton onClick={() => remove(i)} />
          </div>
        </Card>
      ))}
      <AddButton onClick={add} label="+ Add alumnus" />
    </div>
  );
}
