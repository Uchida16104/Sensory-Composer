<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class AnalysisController extends Controller
{
    private string $fastapiUrl;
    private string $rustDspUrl;

    public function __construct()
    {
        $this->fastapiUrl = rtrim(config('services.fastapi.url', 'http://localhost:8001'), '/');
        $this->rustDspUrl = rtrim(config('services.rust_dsp.url', 'http://localhost:8002'), '/');
    }

    public function analyseAudio(Request $request): JsonResponse
    {
        $request->validate([
            'audio_base64' => 'required|string',
        ]);

        try {
            $response = Http::timeout(30)->post("{$this->fastapiUrl}/analysis/audio", [
                'audio_base64' => $request->input('audio_base64'),
            ]);

            if ($response->failed()) {
                return response()->json(['error' => 'FastAPI service error.'], 502);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Analysis service unavailable: ' . $e->getMessage()], 503);
        }
    }

    public function analysePoem(Request $request): JsonResponse
    {
        $request->validate([
            'poem' => 'required|string|max:10000',
        ]);

        try {
            $response = Http::timeout(30)->post("{$this->fastapiUrl}/analysis/poem", [
                'poem' => $request->input('poem'),
            ]);

            if ($response->failed()) {
                return response()->json(['error' => 'FastAPI service error.'], 502);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'Analysis service unavailable: ' . $e->getMessage()], 503);
        }
    }

    public function runFft(Request $request): JsonResponse
    {
        $request->validate([
            'samples' => 'required|array',
            'samples.*' => 'numeric',
        ]);

        try {
            $response = Http::timeout(15)->post("{$this->rustDspUrl}/fft", [
                'samples' => $request->input('samples'),
            ]);

            if ($response->failed()) {
                return response()->json(['error' => 'Rust DSP service error.'], 502);
            }

            return response()->json($response->json());
        } catch (\Exception $e) {
            return response()->json(['error' => 'DSP service unavailable: ' . $e->getMessage()], 503);
        }
    }
}
