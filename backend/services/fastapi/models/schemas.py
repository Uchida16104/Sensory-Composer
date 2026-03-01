from pydantic import BaseModel, Field
from typing import Optional


class AudioAnalysisRequest(BaseModel):
    audio_base64: str = Field(..., description="Base64-encoded audio data (WebM/WAV)")


class AudioAnalysisResponse(BaseModel):
    tempo: Optional[float] = None
    spectral_centroid: Optional[float] = None
    rms_energy: Optional[float] = None
    zero_crossing_rate: Optional[float] = None
    summary: str


class PoemAnalysisRequest(BaseModel):
    poem: str = Field(..., max_length=10000)


class PoemAnalysisResponse(BaseModel):
    word_count: int
    line_count: int
    sentiment: str
    summary: str


class FftRequest(BaseModel):
    samples: list[float] = Field(..., min_length=2)


class FftResponse(BaseModel):
    frequencies: list[float]
    magnitudes: list[float]
    dominant_frequency: float
