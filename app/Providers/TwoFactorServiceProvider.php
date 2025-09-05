<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->singleton(Google2FA::class, function () {
            return new Google2FA();
        });
    }

    public function boot(): void
    {
        //
    }
}