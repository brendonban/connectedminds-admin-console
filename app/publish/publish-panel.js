"use client";

import { useEffect, useState } from "react";

export function PublishPanel() {
  const [message, setMessage] = useState("Publish content changes via admin console");
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [statusError, setStatusError] = useState("");

  async function loadStatus() {
    setLoadingStatus(true);
    setStatusError("");
    try {
      const res = await fetch("/api/publish");
      const json = await res.json();
      if (!res.ok) {
        setStatusError(json.error || "Couldn't load publish status.");
        setStatus(null);
      } else {
        setStatus(json);
      }
    } catch {
      setStatusError("Couldn't reach the server to check publish status.");
      setStatus(null);
    } finally {
      setLoadingStatus(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  async function handlePublish() {
    setRunning(true);
    setResult(null);
    try {
      const res = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const json = await res.json();
      setResult(json);
      await loadStatus();
    } catch {
      setResult({ ok: false, error: "Network error — check your connection and try again." });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="grid gap-4">
      {statusError && (
        <p className="text-danger text-sm max-w-[65ch]">{statusError}</p>
      )}

      {!loadingStatus && status && (
        <div className="rounded-lg border border-divider p-4 grid gap-2">
          {status.pending ? (
            <>
              <p className="font-medium">
                {status.filesChanged.length} file
                {status.filesChanged.length === 1 ? "" : "s"} changed since the last
                publish:
              </p>
              <ul className="text-sm text-muted list-disc pl-5 grid gap-0.5">
                {status.filesChanged.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-muted text-sm">
              No saved changes waiting to be published — the live site already
              matches what&rsquo;s in the editors.
            </p>
          )}
        </div>
      )}

      <label className="grid gap-1 max-w-[500px]">
        <span className="text-sm font-medium text-muted">Commit message</span>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="rounded-lg border border-divider px-3 py-2 w-full outline-none focus:border-accent-primary bg-transparent"
        />
      </label>

      <button
        type="button"
        onClick={handlePublish}
        disabled={running || (status ? !status.pending : false)}
        className="rounded-lg bg-accent-primary text-white font-medium px-4 py-2.5 w-fit hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {running ? "Publishing…" : "Publish changes"}
      </button>

      {result && (
        <div className="grid gap-2 mt-1">
          {result.ok ? (
            <>
              <p className="text-success font-semibold">
                {result.nothingToPublish ? "Nothing to publish." : "Published!"}
              </p>
              {!result.nothingToPublish && (
                <p className="text-muted text-sm max-w-[65ch]">
                  Pushed to the live branch — Vercel will rebuild the public site
                  automatically and the change should be live within a minute or
                  two.
                  {result.commitUrl && (
                    <>
                      {" "}
                      <a
                        href={result.commitUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-accent-primary hover:underline"
                      >
                        View the commit on GitHub
                      </a>
                      .
                    </>
                  )}
                </p>
              )}
            </>
          ) : (
            <p className="text-danger font-semibold max-w-[65ch]">
              {result.error || "Something went wrong."}
            </p>
          )}
        </div>
      )}

      {status && status.recentCommits && status.recentCommits.length > 0 && (
        <div className="grid gap-2 mt-4">
          <h3 className="text-sm font-semibold text-muted">Recent publishes</h3>
          <ul className="grid gap-1.5 text-sm">
            {status.recentCommits.map((c) => (
              <li key={c.sha} className="text-muted">
                <a
                  href={c.url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline hover:text-fg"
                >
                  {c.message}
                </a>{" "}
                <span className="opacity-70">· {c.sha}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
