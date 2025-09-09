<?php

namespace App\Http\Middleware;

use App\Services\TwoFactorAuthenticationService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class TwoFactorAuthentication
{
    public function __construct(
        private TwoFactorAuthenticationService $twoFactorService
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        if (!$user) {
            return $next($request);
        }

        // Skip 2FA verification for certain routes
        if ($this->shouldSkip($request)) {
            return $next($request);
        }

        // Skip 2FA if user used WebAuthn to login (WebAuthn is considered secure enough)
        $webAuthnAuthenticated = session('webauthn_authenticated');
        
        // If user has 2FA enabled but session is not verified (and didn't use WebAuthn)
        if ($user->hasTwoFactorAuthenticationEnabled() && !session('two_factor_verified') && !$webAuthnAuthenticated) {
            // Check if this is a 2FA verification request
            if ($this->is2FAVerificationRequest($request)) {
                return $this->handle2FAVerification($request, $next);
            }

            // Redirect to 2FA verification page
            return redirect()->route('two-factor.challenge');
        }

        return $next($request);
    }

    private function shouldSkip(Request $request): bool
    {
        $skipRoutes = [
            'two-factor.challenge',
            'two-factor.verify',
            'logout',
        ];

        return in_array($request->route()?->getName(), $skipRoutes) ||
               $request->is('api/*') ||
               $request->is('settings/security/two-factor/*');
    }

    private function is2FAVerificationRequest(Request $request): bool
    {
        return $request->route()?->getName() === 'two-factor.verify' ||
               $request->is('two-factor/verify');
    }

    private function handle2FAVerification(Request $request, Closure $next): Response
    {
        if ($request->isMethod('POST')) {
            $code = $request->input('code');
            $recoveryCode = $request->input('recovery_code');
            $user = Auth::user();

            $verified = false;

            if ($code) {
                $verified = $this->twoFactorService->verifyCode(
                    $user->twoFactorAuthentication->secret,
                    $code
                );
            } elseif ($recoveryCode) {
                $verified = $this->twoFactorService->verifyRecoveryCode($user, $recoveryCode);
            }

            if ($verified) {
                session(['two_factor_verified' => true]);
                return redirect()->intended(route('dashboard'));
            }

            return back()->withErrors(['code' => 'The provided code is invalid.']);
        }

        return $next($request);
    }
}