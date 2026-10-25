"use client";

import { useContentEditor } from "../../components/use-content-editor";
import {
  Field,
  TextAreaField,
  Section,
  Card,
  RemoveButton,
  AddButton,
} from "../../components/form-fields";
import { SaveBar } from "../../components/save-bar";

const EMPTY_INTERNSHIP = {
  title: "",
  description: "",
  requirements: "",
  howToApply: "",
};

const EMPTY_COLLAB = {
  title: "",
  description: "",
  contact: "",
};

const EMPTY_FAQ_ITEM = { q: "", a: "" };

export function InternshipCollaborationEditor() {
  const { data, setData, loading, saving, error, savedAt, save } =
    useContentEditor("internship-collaboration");

  if (loading) return <p className="text-muted">Loading…</p>;
  if (!data) return <p className="text-danger">{error || "Failed to load."}</p>;

  const internships = data.internships || [];
  const collaborations = data.collaborations || [];
  const faq = data.faq || [];

  function set(patch) {
    setData({ ...data, ...patch });
  }
  function setContact(patch) {
    setData({ ...data, contact: { ...data.contact, ...patch } });
  }

  function updateInternship(i, patch) {
    set({
      internships: internships.map((it, idx) => (idx === i ? { ...it, ...patch } : it)),
    });
  }
  function removeInternship(i) {
    set({ internships: internships.filter((_, idx) => idx !== i) });
  }
  function addInternship() {
    set({ internships: [...internships, { ...EMPTY_INTERNSHIP }] });
  }

  function updateCollab(i, patch) {
    set({
      collaborations: collaborations.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
    });
  }
  function removeCollab(i) {
    set({ collaborations: collaborations.filter((_, idx) => idx !== i) });
  }
  function addCollab() {
    set({ collaborations: [...collaborations, { ...EMPTY_COLLAB }] });
  }

  function updateFaqItem(i, patch) {
    set({ faq: faq.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  }
  function removeFaqItem(i) {
    set({ faq: faq.filter((_, idx) => idx !== i) });
  }
  function addFaqItem() {
    set({ faq: [...faq, { ...EMPTY_FAQ_ITEM }] });
  }

  return (
    <div className="grid gap-10">
      <Field label="Page title" value={data.title} onChange={(v) => set({ title: v })} />
      <TextAreaField
        label="Intro text"
        value={data.intro}
        onChange={(v) => set({ intro: v })}
        rows={2}
      />

      <Section title="Internship Opportunities">
        <div className="grid gap-4">
          {internships.map((it, i) => (
            <Card key={i}>
              <div className="flex items-start justify-between gap-4">
                <div className="grid gap-3 flex-1">
                  <Field label="Title" value={it.title} onChange={(v) => updateInternship(i, { title: v })} />
                  <TextAreaField
                    label="Description"
                    value={it.description}
                    onChange={(v) => updateInternship(i, { description: v })}
                    rows={2}
                  />
                  <TextAreaField
                    label="Requirements"
                    value={it.requirements}
                    onChange={(v) => updateInternship(i, { requirements: v })}
                    rows={2}
                  />
                  <TextAreaField
                    label="How to apply"
                    value={it.howToApply}
                    onChange={(v) => updateInternship(i, { howToApply: v })}
                    rows={2}
                  />
                </div>
                <RemoveButton onClick={() => removeInternship(i)} />
              </div>
            </Card>
          ))}
          <AddButton onClick={addInternship} label="+ Add internship" />
        </div>
      </Section>

      <Section title="Collaboration Opportunities">
        <div className="grid gap-4">
          {collaborations.map((c, i) => (
            <Card key={i}>
              <div className="flex items-start justify-between gap-4">
                <div className="grid gap-3 flex-1">
                  <Field label="Title" value={c.title} onChange={(v) => updateCollab(i, { title: v })} />
                  <TextAreaField
                    label="Description"
                    value={c.description}
                    onChange={(v) => updateCollab(i, { description: v })}
                    rows={2}
                  />
                  <Field label="Contact name" value={c.contact} onChange={(v) => updateCollab(i, { contact: v })} />
                </div>
                <RemoveButton onClick={() => removeCollab(i)} />
              </div>
            </Card>
          ))}
          <AddButton onClick={addCollab} label="+ Add collaboration opportunity" />
        </div>
      </Section>

      <Section
        title="FAQ"
        description="Shown as a toggle list near the bottom of the page."
      >
        <div className="grid gap-4">
          {faq.map((item, i) => (
            <Card key={i}>
              <div className="flex items-start justify-between gap-4">
                <div className="grid gap-2 flex-1">
                  <Field label="Question" value={item.q} onChange={(v) => updateFaqItem(i, { q: v })} />
                  <TextAreaField label="Answer" value={item.a} onChange={(v) => updateFaqItem(i, { a: v })} rows={3} />
                </div>
                <RemoveButton onClick={() => removeFaqItem(i)} />
              </div>
            </Card>
          ))}
          <AddButton onClick={addFaqItem} label="+ Add question" />
        </div>
      </Section>

      <Section
        title="Get in Touch"
        description="A single highlighted box at the bottom of the page, linking to an email — not a sign-up form."
      >
        <div className="grid gap-3">
          <TextAreaField
            label="Note"
            value={data.contact?.note}
            onChange={(v) => setContact({ note: v })}
            rows={2}
          />
          <Field
            label="Button label"
            value={data.contact?.buttonLabel}
            onChange={(v) => setContact({ buttonLabel: v })}
            placeholder="Get in touch"
          />
          <Field
            label="Email address"
            value={data.contact?.email}
            onChange={(v) => setContact({ email: v })}
            placeholder="you@example.com"
          />
          <Field
            label="Email subject (optional)"
            value={data.contact?.subject}
            onChange={(v) => setContact({ subject: v })}
            placeholder="Internship / Collaboration Inquiry"
          />
        </div>
      </Section>

      <SaveBar saving={saving} error={error} savedAt={savedAt} onSave={save} />
    </div>
  );
}
