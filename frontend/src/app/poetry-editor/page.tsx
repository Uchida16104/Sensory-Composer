"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";

const PoetryEditor = dynamic(() => import("@/components/PoetryEditor"), {
  ssr: false,
});

export default function PoetryEditorPage() {
  const [content, setContent] = useState<string>("");
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; char: string }>
  >([]);

  const handleContentChange = useCallback((text: string) => {
    setContent(text);
    const words = text.trim().split(/\s+/);
    const lastWord = words[words.length - 1] ?? "";
    if (lastWord.length === 1) {
      setParticles((prev) => [
        ...prev.slice(-20),
        {
          id: Date.now(),
          x: Math.random() * 80 + 10,
          y: Math.random() * 60 + 20,
          char: lastWord,
        },
      ]);
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in relative">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        {particles.map((p) => (
          <span
            key={p.id}
            className="absolute text-primary-500/20 text-4xl font-bold select-none"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              animation: "fadeIn 2s ease-out forwards",
              transform: `rotate(${Math.random() * 40 - 20}deg)`,
            }}
          >
            {p.char}
          </span>
        ))}
      </div>

      <h1 className="gradient-text text-4xl font-bold mb-2">Poetry Editor</h1>
      <p className="text-gray-400 mb-8">
        Write in Markdown, preview live, and export your poem. As you type,
        characters drift across the background as visual echoes.
      </p>

      <div className="glass rounded-2xl p-6 min-h-96">
        <PoetryEditor onContentChange={handleContentChange} />
      </div>

      {content && (
        <div className="mt-6 glass rounded-xl p-4 text-sm text-gray-400">
          <p>
            Poem ready.{" "}
            <a href="/score-export" className="text-primary-500 hover:underline">
              Bundle it into a score →
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
