"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PoetryEditorProps {
  onContentChange?: (content: string) => void;
}

export default function PoetryEditor({ onContentChange }: PoetryEditorProps) {
  const [content, setContent] = useState<string>(
    "# My Poem\n\nWrite your poem here...\n\n> *Words are the music of thought.*"
  );
  const [preview, setPreview] = useState<boolean>(false);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
      onContentChange?.(e.target.value);
    },
    [onContentChange]
  );

  const handleExport = useCallback(() => {
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `poem-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [content]);

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setPreview(false)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              !preview
                ? "bg-primary-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Edit
          </button>
          <button
            onClick={() => setPreview(true)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              preview
                ? "bg-primary-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Preview
          </button>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-1.5 rounded-lg text-sm font-medium bg-accent-500 text-white hover:bg-accent-400 transition-colors"
        >
          Export .md
        </button>
      </div>

      {!preview ? (
        <textarea
          value={content}
          onChange={handleChange}
          className="flex-1 w-full min-h-64 bg-dark-900 border border-white/10 rounded-xl p-4 text-gray-200 font-mono text-sm resize-none leading-relaxed"
          placeholder="Write your poem in Markdown..."
          spellCheck
        />
      ) : (
        <div className="flex-1 min-h-64 glass rounded-xl p-6 prose prose-invert max-w-none overflow-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
      )}

      <p className="text-xs text-gray-600">
        {content.split(/\s+/).filter(Boolean).length} words ·{" "}
        {content.length} characters
      </p>
    </div>
  );
}
