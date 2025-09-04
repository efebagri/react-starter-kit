<?php

use Inertia\Inertia;

Route::get('dashboard', function () {
    return Inertia::render('admin/dashboard');
})->name('admin.dashboard');
