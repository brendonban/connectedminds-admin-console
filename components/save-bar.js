"use client";

export function SaveBar({ saving, error, savedAt, onSave, disabled }) {
  return (
    <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t border-divider -mx-4 px-4 py-3 mt-4 flex items-center gap-3">
      <button
        type="button"
        onClick={onSave}
        disabled={saving || disabled}
        className="rounded-lg bg-accent-primary text-white font-medium px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
      {error && <span className="text-danger text-sm">{error}</span>}
      {!error && savedAt && (
        <span className="text-success text-sm">
          Saved at {savedAt.toLocaleTimeString()}
        </span>
      )}
      <span className="text-muted text-xs ml-auto hidden sm:inline">
        Saving writes to the content file. Visit the Publish page to commit &amp; rebuild the live site.
      </span>
    </div>
  );
}
