<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => view('admin.dashboard'));
Route::get('/dashboard', fn () => view('admin.dashboard'))->name('dashboard');
