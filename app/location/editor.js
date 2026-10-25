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
import { ImageUploadField } from "../../components/image-upload-field";
import { SaveBar } from "../../components/save-bar";

const EMPTY_PARKING = { title: "", subtitle: "", rates: [], photo: "" };

export function LocationEditor() {
  const { data, setData, loading, saving, error, savedAt, save } =
    useContentEditor("location");

  if (loading) return <p className="text-muted">Loading…</p>;
  if (!data) return <p className="text-danger">{error || "Failed to load."}</p>;

  const parkingOptions = data.parkingOptions || [];

  function set(patch) {
    setData({ ...data, ...patch });
  }
  function setNested(key, patch) {
    setData({ ...data, [key]: { ...data[key], ...patch } });
  }

  function updateParking(i, patch) {
    set({
      parkingOptions: parkingOptions.map((p, idx) => (idx === i ? { ...p, ...patch } : p)),
    });
  }
  function removeParking(i) {
    set({ parkingOptions: parkingOptions.filter((_, idx) => idx !== i) });
  }
  function addParking() {
    set({ parkingOptions: [...parkingOptions, { ...EMPTY_PARKING, rates: [] }] });
  }

  return (
    <div className="grid gap-10">
      <Section title="Page Header">
        <div className="grid gap-3">
          <Field label="Title" value={data.title} onChange={(v) => set({ title: v })} />
          <TextAreaField label="Intro" value={data.intro} onChange={(v) => set({ intro: v })} rows={3} />
          <TextAreaField label="Address" value={data.address} onChange={(v) => set({ address: v })} rows={2} />
        </div>
      </Section>

      <Section title="Parking Options">
        <div className="grid gap-4">
          {parkingOptions.map((p, i) => (
            <Card key={i}>
              <div className="flex items-start justify-between gap-4">
                <div className="grid gap-3 flex-1">
                  <ImageUploadField
                    label="Photo (optional)"
                    value={p.photo}
                    onChange={(v) => updateParking(i, { photo: v })}
                    folder="location"
                    uploadLabel={p.title}
                  />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Title" value={p.title} onChange={(v) => updateParking(i, { title: v })} placeholder="Parking 1" />
                    <Field label="Subtitle" value={p.subtitle} onChange={(v) => updateParking(i, { subtitle: v })} placeholder="Sunway University Basement Parking" />
                  </div>
                  <StringListField
                    label="Rates"
                    items={p.rates}
                    onChange={(rates) => updateParking(i, { rates })}
                    placeholder="First 2 hours: RM2.00"
                  />
                </div>
                <RemoveButton onClick={() => removeParking(i)} />
              </div>
            </Card>
          ))}
          <AddButton onClick={addParking} label="+ Add parking option" />
        </div>
      </Section>

      <Section title="Public Transport">
        <div className="grid gap-3">
          <ImageUploadField
            label="Photo (optional)"
            value={data.publicTransport?.photo}
            onChange={(v) => setNested("publicTransport", { photo: v })}
            folder="location"
            uploadLabel="public-transport"
          />
          <Field
            label="Title"
            value={data.publicTransport?.title}
            onChange={(v) => setNested("publicTransport", { title: v })}
          />
          <TextAreaField
            label="Description"
            value={data.publicTransport?.description}
            onChange={(v) => setNested("publicTransport", { description: v })}
            rows={2}
          />
        </div>
      </Section>

      <SaveBar saving={saving} error={error} savedAt={savedAt} onSave={save} />
    </div>
  );
}
