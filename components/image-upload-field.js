"use client";

import { useState } from "react";

/**
 * value: public path like "/images/team/misha-ab12cd34.jpg" (or "")
 * onChange(path): called with the new public path after a successful upload,
 *   or "" when cleared.
 */
export function ImageUploadField({ label, value, onChange, folder, uploadLabel }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      formData.append("label", uploadLabel || "");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Upload failed");
        return;
      }
      onChange(json.path);
    } catch {
      setError("Upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-1">
      {label && <span className="text-sm font-medium text-muted">{label}</span>}
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-accent-primary/10 border border-divider shrink-0 flex items-center justify-center">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/site-images${value}`} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-xs text-muted">No photo</span>
          )}
        </div>
        <div className="grid gap-1">
          <label className="text-sm font-medium text-accent-primary hover:underline cursor-pointer w-fit">
            {uploading ? "Uploading…" : value ? "Replace photo" : "Upload photo"}
            <input
              type="file"
              accept="image/*"
              onChange={handleFile}
              disabled={uploading}
              className="hidden"
            />
          </label>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-xs text-danger hover:underline w-fit"
            >
              Remove photo
            </button>
          )}
        </div>
      </div>
      {error && <span className="text-danger text-xs">{error}</span>}
    </div>
  );
}
