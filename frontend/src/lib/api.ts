import { ScorePackage } from "./indexeddb";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";
const FASTAPI_URL =
  process.env.NEXT_PUBLIC_FASTAPI_URL ?? "http://localhost:8001";

async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}

export async function sendScoreToAPI(pkg: ScorePackage): Promise<void> {
  await apiFetch(`${API_URL}/scores`, {
    method: "POST",
    body: JSON.stringify(pkg),
  });
}

export interface AnalysisResult {
  tempo?: number;
  spectral_centroid?: number;
  rms_energy?: number;
  summary?: string;
}

export async function analyseAudio(
  audioBase64: string
): Promise<AnalysisResult> {
  return apiFetch<AnalysisResult>(`${FASTAPI_URL}/analysis/audio`, {
    method: "POST",
    body: JSON.stringify({ audio_base64: audioBase64 }),
  });
}

export async function summarisePoem(poem: string): Promise<{ summary: string }> {
  return apiFetch<{ summary: string }>(`${FASTAPI_URL}/analysis/poem`, {
    method: "POST",
    body: JSON.stringify({ poem }),
  });
}

export async function getScoresFromAPI(): Promise<ScorePackage[]> {
  return apiFetch<ScorePackage[]>(`${API_URL}/scores`);
}
