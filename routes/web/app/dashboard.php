<?php

use Inertia\Inertia;

// Redirect app/ to dashboard
Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::get('dashboard', function () {
    return Inertia::render('app/dashboard');
})->name('dashboard');

