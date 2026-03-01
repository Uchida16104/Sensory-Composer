<?php

use App\Http\Controllers\ScoreController;
use App\Http\Controllers\AnalysisController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::apiResource('scores', ScoreController::class)
        ->only(['index', 'store', 'show', 'destroy']);

    Route::post('analysis/audio', [AnalysisController::class, 'analyseAudio']);
    Route::post('analysis/poem', [AnalysisController::class, 'analysePoem']);
    Route::post('analysis/fft', [AnalysisController::class, 'runFft']);
});

Route::get('/health', fn () => response()->json(['status' => 'ok', 'service' => 'laravel']));
