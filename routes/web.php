<?php

use App\Http\Middleware\TwoFactorAuthentication;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Homepage / Auth
require __DIR__ . '/web/home/homepage.php';
require __DIR__ . '/web/auth.php';

// Secured Routes
Route::middleware(['auth', 'verified', TwoFactorAuthentication::class])->group(function () {
    // Customer Portal
    Route::group(['prefix' => 'app'], function () {
        require __DIR__ . '/web/app/dashboard.php';
        require __DIR__ . '/web/app/settings.php';
    });

    // Admin Portal
    Route::group(['prefix' => 'admin'], function () {
        require __DIR__ . '/web/admin/dashboard.php';
    });
});
