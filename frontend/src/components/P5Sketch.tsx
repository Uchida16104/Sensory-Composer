"use client";

import { useEffect, useRef } from "react";

interface P5SketchProps {
  analyserNode: AnalyserNode | null;
  width?: number;
  height?: number;
}

export default function P5Sketch({
  analyserNode,
  width = 800,
  height = 400,
}: P5SketchProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (analyserNode) {
      analyserNode.fftSize = 256;
      const bufferLength = analyserNode.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);
    }

    function draw() {
      if (!canvas || !ctx) return;
      animFrameRef.current = requestAnimationFrame(draw);

      ctx.fillStyle = "rgba(13, 13, 26, 0.3)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (analyserNode && dataArrayRef.current) {
        analyserNode.getByteFrequencyData(dataArrayRef.current);
        const bufferLength = dataArrayRef.current.length;
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArrayRef.current[i] / 255) * canvas.height;
          const hue = (i / bufferLength) * 280 + 180;
          ctx.fillStyle = `hsla(${hue}, 80%, 60%, 0.9)`;
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
          x += barWidth + 1;
        }
      } else {
        const time = Date.now() * 0.001;
        ctx.strokeStyle = "rgba(76, 110, 245, 0.6)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x++) {
          const y =
            canvas.height / 2 +
            Math.sin(x * 0.02 + time) * 40 +
            Math.sin(x * 0.05 + time * 1.5) * 20;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [analyserNode]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="rounded-xl w-full"
      style={{ background: "transparent" }}
    />
  );
}
