"use client";

import { useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";

const P5Sketch = dynamic(() => import("@/components/P5Sketch"), { ssr: false });

export default function AudioStudioPage() {
  const [recording, setRecording] = useState<boolean>(false);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string>("");

  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      setAnalyserNode(analyser);

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
      };

      recorder.start(100);
      setRecording(true);
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setError(
          "Microphone permission denied. Please allow microphone access in your browser settings."
        );
      } else {
        setError("Could not access microphone. Please check your device.");
      }
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    audioContextRef.current?.close();
    setAnalyserNode(null);
    setRecording(false);
  }, []);

  const downloadAudio = useCallback(() => {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `capture-${Date.now()}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  }, [audioBlob]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 animate-fade-in">
      <h1 className="gradient-text text-4xl font-bold mb-2">Audio Studio</h1>
      <p className="text-gray-400 mb-8">
        Speak, sing, or play — your microphone input is analysed in real time
        and painted as light on the canvas below.
      </p>

      <div className="glass rounded-2xl p-2 mb-6">
        <P5Sketch analyserNode={analyserNode} width={800} height={360} />
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        {!recording ? (
          <button
            onClick={startRecording}
            className="px-6 py-2.5 rounded-xl bg-accent-500 text-white font-medium hover:bg-accent-400 transition-colors"
          >
            ● Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-500 transition-colors animate-pulse-slow"
          >
            ■ Stop Recording
          </button>
        )}

        {audioBlob && (
          <button
            onClick={downloadAudio}
            className="px-6 py-2.5 rounded-xl glass text-gray-200 font-medium hover:border-primary-500 transition-colors"
          >
            ↓ Download Audio
          </button>
        )}
      </div>

      {error && (
        <div className="glass rounded-xl p-4 border border-red-500/40 text-red-300 text-sm">
          {error}
        </div>
      )}

      {audioBlob && (
        <div className="glass rounded-xl p-4 text-sm text-gray-400">
          <p>
            Audio captured:{" "}
            <span className="text-green-400 font-mono">
              {(audioBlob.size / 1024).toFixed(1)} KB
            </span>
          </p>
          <p className="mt-1">
            Go to{" "}
            <a href="/score-export" className="text-primary-500 hover:underline">
              Score Export
            </a>{" "}
            to bundle this with your poem and visuals.
          </p>
        </div>
      )}
    </div>
  );
}
