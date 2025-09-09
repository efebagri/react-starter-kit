<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DisableCsrfForWebAuthn
{
    public function handle(Request $request, Closure $next): Response
    {
        // Disable CSRF token verification for WebAuthn routes
        if ($request->is('webauthn/*')) {
            $request->session()->regenerateToken();
        }

        return $next($request);
    }
}