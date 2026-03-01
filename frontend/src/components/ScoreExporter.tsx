"use client";

import { useState, useCallback } from "react";
import { saveScore, getAllScores, ScorePackage } from "@/lib/indexeddb";
import { syncToCouchDB } from "@/lib/pouchdb";
import { sendScoreToAPI } from "@/lib/api";

interface ScoreExporterProps {
  audioBlob?: Blob | null;
  visualDataUrl?: string | null;
  poem?: string;
}

export default function ScoreExporter({
  audioBlob,
  visualDataUrl,
  poem = "",
}: ScoreExporterProps) {
  const [title, setTitle] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [scores, setScores] = useState<ScorePackage[]>([]);
  const [showScores, setShowScores] = useState<boolean>(false);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      setStatus("Please enter a title for your score.");
      return;
    }

    setSaving(true);
    setStatus("Saving locally…");

    try {
      const audioBase64 = audioBlob
        ? await blobToBase64(audioBlob)
        : undefined;

      const pkg: ScorePackage = {
        id: `score-${Date.now()}`,
        title: title.trim(),
        poem,
        audioBase64,
        visualDataUrl: visualDataUrl ?? undefined,
        createdAt: new Date().toISOString(),
      };

      await saveScore(pkg);
      setStatus("Saved to IndexedDB. Syncing to CouchDB…");

      await syncToCouchDB(pkg);
      setStatus("Synced to CouchDB. Sending to server…");

      await sendScoreToAPI(pkg);
      setStatus("✅ Score saved, synced, and sent to server.");
    } catch (err) {
      console.error(err);
      setStatus(
        "⚠️ Saved locally but sync/server failed. Will retry when online."
      );
    } finally {
      setSaving(false);
    }
  }, [title, poem, audioBlob, visualDataUrl]);

  const handleShowScores = useCallback(async () => {
    const all = await getAllScores();
    setScores(all);
    setShowScores(true);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3 items-center">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Score title…"
          className="flex-1 bg-dark-900 border border-white/10 rounded-xl px-4 py-2 text-gray-200 text-sm"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-5 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Score"}
        </button>
      </div>

      {status && (
        <p className="text-xs text-gray-400 animate-fade-in">{status}</p>
      )}

      <div className="glass rounded-xl p-4 text-xs text-gray-400 space-y-1">
        <p>
          Audio:{" "}
          <span className={audioBlob ? "text-green-400" : "text-gray-600"}>
            {audioBlob ? `${(audioBlob.size / 1024).toFixed(1)} KB` : "none"}
          </span>
        </p>
        <p>
          Visuals:{" "}
          <span className={visualDataUrl ? "text-green-400" : "text-gray-600"}>
            {visualDataUrl ? "canvas snapshot ready" : "none"}
          </span>
        </p>
        <p>
          Poem:{" "}
          <span className={poem ? "text-green-400" : "text-gray-600"}>
            {poem ? `${poem.split(/\s+/).filter(Boolean).length} words` : "none"}
          </span>
        </p>
      </div>

      <button
        onClick={handleShowScores}
        className="text-xs text-primary-500 hover:underline self-start"
      >
        View saved scores →
      </button>

      {showScores && scores.length > 0 && (
        <ul className="space-y-2">
          {scores.map((s) => (
            <li
              key={s.id}
              className="glass rounded-lg px-4 py-2 text-sm text-gray-300 flex justify-between"
            >
              <span>{s.title}</span>
              <span className="text-gray-600 text-xs">
                {new Date(s.createdAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}

      {showScores && scores.length === 0 && (
        <p className="text-xs text-gray-600">No scores saved yet.</p>
      )}
    </div>
  );
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
