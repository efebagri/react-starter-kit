<?php

use Inertia\Inertia;

// Redirect admin/ to dashboard
Route::get('/', function () {
    return redirect()->route('dashboard');
});


Route::get('dashboard', function () {
    return Inertia::render('admin/dashboard');
})->name('admin.dashboard');
