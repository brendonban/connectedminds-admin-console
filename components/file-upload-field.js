"use client";

import { useState } from "react";

/**
 * Generic file upload (poster PDFs/images, unlike ImageUploadField which is
 * built specifically for circular photo previews).
 *
 * value: public path like "/images/posters/study-poster-ab12cd34.pdf" (or "")
 * onChange(path): called with the new public path after a successful upload,
 *   or "" when cleared.
 */
export function FileUploadField({ label, value, onChange, folder, uploadLabel }) {
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

  const filename = value ? value.split("/").pop() : "";

  return (
    <div className="grid gap-1">
      {label && <span className="text-sm font-medium text-muted">{label}</span>}
      <div className="flex items-center gap-3 flex-wrap">
        {value ? (
          <a
            href={`/site-images${value}`}
            target="_blank"
            rel="noreferrer"
            className="text-accent-primary hover:underline text-sm font-medium"
          >
            View current file ({filename})
          </a>
        ) : (
          <span className="text-sm text-muted">No file uploaded</span>
        )}
        <label className="text-sm font-medium text-accent-primary hover:underline cursor-pointer w-fit">
          {uploading ? "Uploading…" : value ? "Replace file" : "Upload file"}
          <input
            type="file"
            accept="application/pdf,image/*"
            onChange={handleFile}
            disabled={uploading}
            className="hidden"
          />
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-sm text-danger hover:underline"
          >
            Remove
          </button>
        )}
      </div>
      {error && <span className="text-danger text-xs">{error}</span>}
    </div>
  );
}
