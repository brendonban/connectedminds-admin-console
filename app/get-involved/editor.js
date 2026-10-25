"use client";

import { useContentEditor } from "../../components/use-content-editor";
import {
  Field,
  TextAreaField,
  Section,
  Card,
  RemoveButton,
  AddButton,
  StringListField,
} from "../../components/form-fields";
import { SaveBar } from "../../components/save-bar";
import { FileUploadField } from "../../components/file-upload-field";

const EMPTY_FORM = { label: "", href: "" };
const EMPTY_GROUP = { group: "", forms: [] };

export function GetInvolvedEditor() {
  const { data, setData, loading, saving, error, savedAt, save } =
    useContentEditor("get-involved");

  if (loading) return <p className="text-muted">Loading…</p>;
  if (!data) return <p className="text-danger">{error || "Failed to load."}</p>;

  const signupLinks = data.signupLinks || [];

  function set(patch) {
    setData({ ...data, ...patch });
  }
  function setNested(key, patch) {
    setData({ ...data, [key]: { ...data[key], ...patch } });
  }

  function updateGroup(gi, patch) {
    set({
      signupLinks: signupLinks.map((g, idx) => (idx === gi ? { ...g, ...patch } : g)),
    });
  }
  function removeGroup(gi) {
    set({ signupLinks: signupLinks.filter((_, idx) => idx !== gi) });
  }
  function addGroup() {
    set({ signupLinks: [...signupLinks, { ...EMPTY_GROUP, forms: [] }] });
  }
  function updateForm(gi, fi, patch) {
    const forms = [...signupLinks[gi].forms];
    forms[fi] = { ...forms[fi], ...patch };
    updateGroup(gi, { forms });
  }
  function removeForm(gi, fi) {
    updateGroup(gi, { forms: signupLinks[gi].forms.filter((_, idx) => idx !== fi) });
  }
  function addForm(gi) {
    updateGroup(gi, { forms: [...signupLinks[gi].forms, { ...EMPTY_FORM }] });
  }

  return (
    <div className="grid gap-10">
      <Section title="Page Header">
        <div className="grid gap-3">
          <Field label="Title" value={data.title} onChange={(v) => set({ title: v })} />
          <Field label="Subtitle" value={data.subtitle} onChange={(v) => set({ subtitle: v })} />
          <TextAreaField label="Intro paragraph" value={data.intro} onChange={(v) => set({ intro: v })} rows={2} />
        </div>
      </Section>

      <Section
        title="Poster"
        description="Optional. When uploaded, a “View Poster” button appears next to the page title. Accepts PDF, JPG, PNG, WEBP, or GIF — max 4MB."
      >
        <FileUploadField
          value={data.poster}
          onChange={(v) => set({ poster: v })}
          folder="posters"
          uploadLabel="participation poster"
        />
      </Section>

      <Section title="Study Details">
        <div className="grid gap-3">
          <Field
            label="Venue"
            value={data.studyDetails?.venue}
            onChange={(v) => setNested("studyDetails", { venue: v })}
          />
          <Field
            label="Date and time"
            value={data.studyDetails?.dateTime}
            onChange={(v) => setNested("studyDetails", { dateTime: v })}
          />
          <Field
            label="Duration"
            value={data.studyDetails?.duration}
            onChange={(v) => setNested("studyDetails", { duration: v })}
          />
        </div>
      </Section>

      <Section title="Eligibility">
        <div className="grid gap-3">
          <Field
            label="Intro line"
            value={data.eligibility?.intro}
            onChange={(v) => setNested("eligibility", { intro: v })}
          />
          <StringListField
            label="Eligibility criteria"
            items={data.eligibility?.items}
            onChange={(items) => setNested("eligibility", { items })}
          />
          <Field
            label="Partner note"
            value={data.eligibility?.partnerNote}
            onChange={(v) => setNested("eligibility", { partnerNote: v })}
          />
        </div>
      </Section>

      <Section title="Choosing a Partner">
        <TextAreaField
          value={data.partnerSection}
          onChange={(v) => set({ partnerSection: v })}
          rows={3}
        />
      </Section>

      <Section title="Compensation">
        <StringListField
          items={data.compensation}
          onChange={(compensation) => set({ compensation })}
        />
      </Section>

      <Section title="Study Timeline">
        <div className="grid gap-3">
          <Field
            label="Note (shown in italics above the steps)"
            value={data.timeline?.note}
            onChange={(v) => setNested("timeline", { note: v })}
          />
          <StringListField
            label="Steps"
            items={data.timeline?.steps}
            onChange={(steps) => setNested("timeline", { steps })}
          />
        </div>
      </Section>

      <Section title="Notes">
        <StringListField items={data.notes} onChange={(notes) => set({ notes })} />
      </Section>

      <Section title="Confidentiality">
        <TextAreaField
          value={data.confidentiality}
          onChange={(v) => set({ confidentiality: v })}
          rows={3}
        />
      </Section>

      <p className="text-muted text-sm -mt-6">
        Location details and FAQ now have their own pages — edit them from
        the Location and FAQ sections in the sidebar.
      </p>

      <Section title="Researcher Contact">
        <div className="grid gap-3">
          <Field
            label="Name"
            value={data.researcher?.name}
            onChange={(v) => setNested("researcher", { name: v })}
          />
          <Field
            label="Email"
            value={data.researcher?.email}
            onChange={(v) => setNested("researcher", { email: v })}
          />
          <Field
            label="Phone (for tel: link, e.g. +601169221207)"
            value={data.researcher?.phone}
            onChange={(v) => setNested("researcher", { phone: v })}
          />
          <Field
            label="Phone (display, e.g. +60 11-6922 1207)"
            value={data.researcher?.phoneDisplay}
            onChange={(v) => setNested("researcher", { phoneDisplay: v })}
          />
        </div>
      </Section>

      <Section title="Sign-up Links">
        <div className="grid gap-4">
          {signupLinks.map((group, gi) => (
            <Card key={gi}>
              <div className="flex items-start justify-between gap-4">
                <Field
                  label="Group name"
                  value={group.group}
                  onChange={(v) => updateGroup(gi, { group: v })}
                  className="flex-1"
                />
                <RemoveButton onClick={() => removeGroup(gi)} label="Remove group" />
              </div>
              <div className="grid gap-2">
                <span className="text-sm font-medium text-muted">Forms</span>
                {(group.forms || []).map((f, fi) => (
                  <div key={fi} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={f.label}
                      onChange={(e) => updateForm(gi, fi, { label: e.target.value })}
                      placeholder="English"
                      className="rounded-lg border border-divider px-3 py-2 w-32 outline-none focus:border-accent-primary bg-transparent"
                    />
                    <input
                      type="text"
                      value={f.href}
                      onChange={(e) => updateForm(gi, fi, { href: e.target.value })}
                      placeholder="https://forms.gle/..."
                      className="rounded-lg border border-divider px-3 py-2 w-full outline-none focus:border-accent-primary bg-transparent"
                    />
                    <RemoveButton onClick={() => removeForm(gi, fi)} />
                  </div>
                ))}
                <AddButton onClick={() => addForm(gi)} label="+ Add form" />
              </div>
            </Card>
          ))}
          <AddButton onClick={addGroup} label="+ Add sign-up group" />
        </div>
      </Section>

      <SaveBar saving={saving} error={error} savedAt={savedAt} onSave={save} />
    </div>
  );
}
