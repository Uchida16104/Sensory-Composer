<?php

return [
    'fastapi' => [
        'url' => env('FASTAPI_URL', 'http://localhost:8001'),
    ],
    'rust_dsp' => [
        'url' => env('RUST_DSP_URL', 'http://localhost:8002'),
    ],
    'couchdb' => [
        'url' => env('COUCHDB_URL', 'http://localhost:5984'),
        'db'  => env('COUCHDB_DB', 'sensory-composer-scores'),
    ],
];
