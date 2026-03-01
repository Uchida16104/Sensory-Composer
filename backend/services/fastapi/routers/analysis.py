import base64
import io
import math
import numpy as np
from fastapi import APIRouter, HTTPException
from models.schemas import (
    AudioAnalysisRequest,
    AudioAnalysisResponse,
    PoemAnalysisRequest,
    PoemAnalysisResponse,
    FftRequest,
    FftResponse,
)

router = APIRouter()


def _decode_audio_to_pcm(audio_base64: str) -> np.ndarray:
    try:
        raw = base64.b64decode(audio_base64)
        samples = np.frombuffer(raw[-4096:], dtype=np.int16).astype(np.float32)
        if samples.size == 0:
            samples = np.zeros(1024, dtype=np.float32)
        return samples
    except Exception:
        return np.zeros(1024, dtype=np.float32)


@router.post("/audio", response_model=AudioAnalysisResponse)
def analyse_audio(req: AudioAnalysisRequest) -> AudioAnalysisResponse:
    samples = _decode_audio_to_pcm(req.audio_base64)

    rms = float(np.sqrt(np.mean(samples ** 2))) if samples.size > 0 else 0.0

    if samples.size >= 2:
        fft_result = np.abs(np.fft.rfft(samples))
        freqs = np.fft.rfftfreq(samples.size, d=1.0 / 44100)
        if fft_result.size > 0 and fft_result.sum() > 0:
            spectral_centroid = float(
                np.sum(freqs * fft_result) / np.sum(fft_result)
            )
        else:
            spectral_centroid = 0.0
    else:
        spectral_centroid = 0.0

    zcr = float(
        np.mean(np.abs(np.diff(np.sign(samples)))) / 2
    ) if samples.size > 1 else 0.0

    tempo_estimate = 60.0 + (rms / 32768.0) * 80.0

    summary = (
        f"Estimated tempo: {tempo_estimate:.1f} BPM. "
        f"Spectral centroid: {spectral_centroid:.1f} Hz. "
        f"RMS energy: {rms:.2f}. "
        f"Zero-crossing rate: {zcr:.4f}."
    )

    return AudioAnalysisResponse(
        tempo=round(tempo_estimate, 2),
        spectral_centroid=round(spectral_centroid, 2),
        rms_energy=round(rms, 4),
        zero_crossing_rate=round(zcr, 6),
        summary=summary,
    )


@router.post("/poem", response_model=PoemAnalysisResponse)
def analyse_poem(req: PoemAnalysisRequest) -> PoemAnalysisResponse:
    poem = req.poem.strip()
    if not poem:
        raise HTTPException(status_code=422, detail="Poem text is empty.")

    words = poem.split()
    lines = [ln for ln in poem.splitlines() if ln.strip()]

    positive_words = {"love", "joy", "light", "beautiful", "peace", "hope", "dream", "bright"}
    negative_words = {"dark", "sorrow", "pain", "loss", "fear", "cold", "silence", "void"}

    lower_words = {w.lower().strip(".,!?;:\"'") for w in words}
    pos_score = len(lower_words & positive_words)
    neg_score = len(lower_words & negative_words)

    if pos_score > neg_score:
        sentiment = "positive"
    elif neg_score > pos_score:
        sentiment = "melancholic"
    else:
        sentiment = "neutral"

    summary = (
        f"The poem contains {len(words)} words across {len(lines)} lines "
        f"with an overall {sentiment} sentiment."
    )

    return PoemAnalysisResponse(
        word_count=len(words),
        line_count=len(lines),
        sentiment=sentiment,
        summary=summary,
    )


@router.post("/fft", response_model=FftResponse)
def run_fft(req: FftRequest) -> FftResponse:
    samples = np.array(req.samples, dtype=np.float64)
    fft_result = np.abs(np.fft.rfft(samples))
    freqs = np.fft.rfftfreq(len(samples), d=1.0 / 44100).tolist()
    magnitudes = fft_result.tolist()

    dominant_idx = int(np.argmax(fft_result))
    dominant_frequency = float(freqs[dominant_idx]) if freqs else 0.0

    return FftResponse(
        frequencies=freqs,
        magnitudes=magnitudes,
        dominant_frequency=dominant_frequency,
    )
