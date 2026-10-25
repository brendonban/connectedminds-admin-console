"use client";

import { Field, TextAreaField, Card, RemoveButton, AddButton } from "../../components/form-fields";
import { ImageUploadField } from "../../components/image-upload-field";

const LINK_TYPES = ["website", "cv", "gscholar", "github", "linkedin", "bluesky"];
const EMPTY_PERSON = { name: "", jobtitle: "", degree: "", photo: "", bio: "", links: [] };

export function PersonListEditor({ people, onChange, addLabel }) {
  const list = people || [];

  function updatePerson(i, patch) {
    onChange(list.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }

  function removePerson(i) {
    onChange(list.filter((_, idx) => idx !== i));
  }

  function addPerson() {
    onChange([...list, { ...EMPTY_PERSON, links: [] }]);
  }

  function updateLink(i, li, patch) {
    const links = [...(list[i].links || [])];
    links[li] = { ...links[li], ...patch };
    updatePerson(i, { links });
  }

  function removeLink(i, li) {
    const links = (list[i].links || []).filter((_, idx) => idx !== li);
    updatePerson(i, { links });
  }

  function addLink(i) {
    const links = [...(list[i].links || []), { type: "website", href: "" }];
    updatePerson(i, { links });
  }

  return (
    <div className="grid gap-4">
      {list.map((person, i) => (
        <Card key={i}>
          <div className="flex items-start justify-between gap-4">
            <div className="grid gap-3 flex-1">
              <ImageUploadField
                label="Photo (optional — falls back to initials)"
                value={person.photo}
                onChange={(v) => updatePerson(i, { photo: v })}
                folder="team"
                uploadLabel={person.name}
              />
              <div className="grid sm:grid-cols-2 gap-3">
                <Field
                  label="Name"
                  value={person.name}
                  onChange={(v) => updatePerson(i, { name: v })}
                />
                <Field
                  label="Badge (optional, e.g. PI, Supervisor, PhD, Postdoc)"
                  value={person.degree}
                  onChange={(v) => updatePerson(i, { degree: v })}
                  placeholder="PhD"
                />
                <Field
                  label="Role / job title"
                  value={person.jobtitle}
                  onChange={(v) => updatePerson(i, { jobtitle: v })}
                  placeholder="Research Assistant"
                  className="sm:col-span-2"
                />
              </div>
              <TextAreaField
                label="Bio (optional)"
                value={person.bio}
                onChange={(v) => updatePerson(i, { bio: v })}
                rows={2}
              />
            </div>
            <RemoveButton onClick={() => removePerson(i)} />
          </div>

          <div className="grid gap-2">
            <span className="text-sm font-medium text-muted">Links (optional)</span>
            {(person.links || []).map((link, li) => (
              <div key={li} className="flex items-center gap-2">
                <select
                  value={link.type}
                  onChange={(e) => updateLink(i, li, { type: e.target.value })}
                  className="rounded-lg border border-divider px-2 py-2 bg-transparent"
                >
                  {LINK_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={link.href}
                  onChange={(e) => updateLink(i, li, { href: e.target.value })}
                  placeholder="https://..."
                  className="rounded-lg border border-divider px-3 py-2 w-full outline-none focus:border-accent-primary bg-transparent"
                />
                <RemoveButton onClick={() => removeLink(i, li)} />
              </div>
            ))}
            <AddButton onClick={() => addLink(i)} label="+ Add link" />
          </div>
        </Card>
      ))}
      <AddButton onClick={addPerson} label={addLabel || "+ Add person"} />
    </div>
  );
}
