"use client";

import { useContentEditor } from "../../components/use-content-editor";
import { Section, TextAreaField } from "../../components/form-fields";
import { SaveBar } from "../../components/save-bar";
import { PersonListEditor } from "./person-editor";
import { AlumniEditor } from "./alumni-editor";

export function TeamEditor() {
  const { data, setData, loading, saving, error, savedAt, save } =
    useContentEditor("team");

  if (loading) return <p className="text-muted">Loading…</p>;
  if (!data) return <p className="text-danger">{error || "Failed to load."}</p>;

  return (
    <div className="grid gap-10">
      <TextAreaField
        label="Intro text (shown above the team grid)"
        value={data.intro}
        onChange={(v) => setData({ ...data, intro: v })}
        rows={2}
      />

      <Section title="Team Members">
        <PersonListEditor
          people={data.members}
          onChange={(members) => setData({ ...data, members })}
          addLabel="+ Add team member"
        />
      </Section>

      <Section title="Faculty Supervisors">
        <PersonListEditor
          people={data.supervisors}
          onChange={(supervisors) => setData({ ...data, supervisors })}
          addLabel="+ Add faculty supervisor"
        />
      </Section>

      <Section title="Alumni">
        <AlumniEditor
          alumni={data.alumni}
          onChange={(alumni) => setData({ ...data, alumni })}
        />
      </Section>

      <Section title="Collaborators">
        <TextAreaField
          label="Collaborators note"
          value={data.collaboratorsNote}
          onChange={(v) => setData({ ...data, collaboratorsNote: v })}
          rows={2}
        />
      </Section>

      <SaveBar saving={saving} error={error} savedAt={savedAt} onSave={save} />
    </div>
  );
}
