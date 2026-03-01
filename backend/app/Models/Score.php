<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Score extends Model
{
    use HasFactory;

    protected $fillable = [
        'external_id',
        'title',
        'poem',
        'audio_base64',
        'visual_data_url',
        'captured_at',
    ];

    protected $hidden = [
        'audio_base64',
        'visual_data_url',
    ];

    protected $casts = [
        'captured_at' => 'datetime',
    ];
}
