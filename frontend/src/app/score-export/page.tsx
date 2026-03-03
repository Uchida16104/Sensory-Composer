"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";

const ScoreExporter = dynamic(() => import("@/components/ScoreExporter"), {
  ssr: false,
});

export default function ScoreExportPage() {
  const [audioBlob, setAudioBlob] = useState<File | null>(null);
  const [visualDataUrl, setVisualDataUrl] = useState<string | null>(null);
  const [poem, setPoem] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleAudioUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) setAudioBlob(file);
    },
    []
  );

  const handleVisualUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setVisualDataUrl(reader.result as string);
      reader.readAsDataURL(file);
    },
    []
  );

  const captureCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setVisualDataUrl(canvas.toDataURL("image/png"));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 animate-fade-in">
      <h1 className="gradient-text text-4xl font-bold mb-2">Score Export</h1>
      <p className="text-gray-400 mb-8">
        Assemble your audio snapshot, visual canvas, and poem into a single
        score package. It is saved offline in IndexedDB and synced to CouchDB
        automatically.
      </p>

      <div className="space-y-4 mb-8">
        <div className="glass rounded-xl p-5">
          <h2 className="text-white font-medium mb-3">1. Audio</h2>
          <input
            type="file"
            accept="audio/*"
            onChange={handleAudioUpload}
            className="text-sm text-gray-400 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-primary-500 file:text-white file:text-sm hover:file:bg-primary-600 cursor-pointer"
          />
          {audioBlob && (
            <p className="mt-2 text-xs text-green-400">
              {audioBlob.name ?? "Recorded audio"} —{" "}
              {(audioBlob.size / 1024).toFixed(1)} KB
            </p>
          )}
        </div>

        <div className="glass rounded-xl p-5">
          <h2 className="text-white font-medium mb-3">2. Visual</h2>
          <input
            type="file"
            accept="image/*"
            onChange={handleVisualUpload}
            className="text-sm text-gray-400 file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:bg-primary-500 file:text-white file:text-sm hover:file:bg-primary-600 cursor-pointer"
          />
          <button
            onClick={captureCanvas}
            className="ml-2 text-xs text-primary-500 hover:underline"
          >
            or capture canvas
          </button>
          {visualDataUrl && (
            <img
              src={visualDataUrl}
              alt="Visual preview"
              className="mt-3 rounded-lg max-h-32 object-cover"
            />
          )}
          <canvas ref={canvasRef} className="hidden" width={800} height={400} />
        </div>

        <div className="glass rounded-xl p-5">
          <h2 className="text-white font-medium mb-3">3. Poem</h2>
          <textarea
            value={poem}
            onChange={(e) => setPoem(e.target.value)}
            placeholder="Paste or type your poem here…"
            rows={5}
            className="w-full bg-dark-900 border border-white/10 rounded-xl p-3 text-gray-200 text-sm font-mono resize-none"
          />
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-4">Save & Sync</h2>
        <ScoreExporter
          audioBlob={audioBlob}
          visualDataUrl={visualDataUrl}
          poem={poem}
        />
      </div>
    </div>
  );
}
