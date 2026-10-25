"use client";

import { useEffect, useState, useCallback } from "react";

export function useContentEditor(type) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/content/${type}`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        if (json.error) {
          setError(json.error);
        } else {
          setData(json.data);
        }
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load content");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type]);

  const save = useCallback(async () => {
    setSaving(true);
    setError("");
    setSavedAt(null);
    try {
      const res = await fetch(`/api/content/${type}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Save failed");
      } else {
        setSavedAt(new Date());
      }
    } catch {
      setError("Save failed. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }, [type, data]);

  return { data, setData, loading, saving, error, savedAt, save };
}
