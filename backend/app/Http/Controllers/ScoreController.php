<?php

namespace App\Http\Controllers;

use App\Models\Score;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ScoreController extends Controller
{
    public function index(): JsonResponse
    {
        $scores = Score::latest()->get(['id', 'title', 'poem', 'created_at']);
        return response()->json($scores);
    }

    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'id'            => 'nullable|string|max:64',
                'title'         => 'required|string|max:255',
                'poem'          => 'nullable|string',
                'audioBase64'   => 'nullable|string',
                'visualDataUrl' => 'nullable|string',
                'createdAt'     => 'nullable|string',
            ]);
        } catch (ValidationException $e) {
            return response()->json(['errors' => $e->errors()], 422);
        }

        $score = Score::updateOrCreate(
            ['external_id' => $validated['id'] ?? Str::uuid()],
            [
                'title'          => $validated['title'],
                'poem'           => $validated['poem'] ?? null,
                'audio_base64'   => $validated['audioBase64'] ?? null,
                'visual_data_url'=> $validated['visualDataUrl'] ?? null,
                'captured_at'    => $validated['createdAt'] ?? now()->toISOString(),
            ]
        );

        return response()->json($score, 201);
    }

    public function show(Score $score): JsonResponse
    {
        return response()->json($score);
    }

    public function destroy(Score $score): JsonResponse
    {
        $score->delete();
        return response()->json(['message' => 'Score deleted.']);
    }
}
