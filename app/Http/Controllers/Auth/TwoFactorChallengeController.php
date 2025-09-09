<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\TwoFactorAuthenticationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class TwoFactorChallengeController extends Controller
{
    public function __construct(
        private TwoFactorAuthenticationService $twoFactorService
    ) {}

    public function show()
    {
        return Inertia::render('auth/two-factor-challenge');
    }

    public function store(Request $request)
    {
        $request->validate([
            'code' => 'nullable|string',
            'recovery_code' => 'nullable|string',
        ]);

        $user = Auth::user();

        if (!$user || !$user->hasTwoFactorAuthenticationEnabled()) {
            throw ValidationException::withMessages([
                'code' => 'Two-factor authentication is not enabled.',
            ]);
        }

        $verified = false;

        if ($request->filled('code')) {
            $verified = $this->twoFactorService->verifyCode(
                $user->twoFactorAuthentication->secret,
                $request->code
            );
        } elseif ($request->filled('recovery_code')) {
            $verified = $this->twoFactorService->verifyRecoveryCode($user, $request->recovery_code);
        }

        if (!$verified) {
            throw ValidationException::withMessages([
                $request->filled('code') ? 'code' : 'recovery_code' => 'The provided authentication code is invalid.',
            ]);
        }

        session(['two_factor_verified' => true]);

        return redirect()->intended(route('dashboard'));
    }
}