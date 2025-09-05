<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Services\TwoFactorAuthenticationService;
use App\Services\WebAuthnService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class SecurityController extends Controller
{
    public function __construct(
        private TwoFactorAuthenticationService $twoFactorService,
        private WebAuthnService $webAuthnService
    ) {}

    public function edit(Request $request)
    {
        $user = $request->user();

        return Inertia::render('app/settings/security', [
            'twoFactorEnabled' => $user->hasTwoFactorAuthenticationEnabled(),
            'webAuthnCredentials' => $this->webAuthnService->getUserCredentials($user),
            'recoveryCodes' => $user->twoFactorAuthentication?->recovery_codes ?? [],
        ]);
    }

    // Two-Factor Authentication Methods

    public function enableTwoFactor(Request $request)
    {
        try {
            $user = $request->user();

            if ($user->hasTwoFactorAuthenticationEnabled()) {
                return response()->json(['error' => 'Two-factor authentication is already enabled'], 400);
            }

            $twoFactor = $this->twoFactorService->enableTwoFactorAuthentication($user);
            $qrCode = $this->twoFactorService->generateQrCode($user, $twoFactor->secret);

            return response()->json([
                'qr_code' => $qrCode,
                'recovery_codes' => $twoFactor->recovery_codes,
            ]);
        } catch (\Exception $e) {
            \Log::error('2FA Enable Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function confirmTwoFactor(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:6',
        ]);

        $user = $request->user();

        if (!$this->twoFactorService->confirmTwoFactorAuthentication($user, $request->code)) {
            throw ValidationException::withMessages([
                'code' => 'The provided two-factor authentication code is invalid.',
            ]);
        }

        return response()->json(['message' => 'Two-factor authentication has been confirmed and enabled.']);
    }

    public function disableTwoFactor(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
        ]);

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => 'The provided password is incorrect.',
            ]);
        }

        $this->twoFactorService->disableTwoFactorAuthentication($user);

        return redirect()->back()->with('success', 'Two-factor authentication has been disabled.');
    }

    public function regenerateRecoveryCodes(Request $request)
    {
        $user = $request->user();

        if (!$user->hasTwoFactorAuthenticationEnabled()) {
            return response()->json(['error' => 'Two-factor authentication is not enabled'], 400);
        }

        $recoveryCodes = $this->twoFactorService->regenerateRecoveryCodes($user);

        return response()->json(['recovery_codes' => $recoveryCodes]);
    }

    // WebAuthn Methods

    public function webAuthnRegisterOptions(Request $request)
    {
        $user = $request->user();
        $options = $this->webAuthnService->generateRegistrationOptions($user);

        // Store options in session for verification
        session(['webauthn_creation_options' => $options]);

        return response()->json($options);
    }

    public function webAuthnRegister(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'credential' => 'required|array',
        ]);

        $user = $request->user();
        $options = session('webauthn_creation_options');

        if (!$options) {
            return response()->json(['error' => 'No registration options found'], 400);
        }

        try {
            $credential = $this->webAuthnService->verifyAndStoreCredential(
                $user,
                $request->credential,
                $request->name,
                $options
            );

            session()->forget('webauthn_creation_options');

            return response()->json([
                'message' => 'Passkey registered successfully',
                'credential' => [
                    'id' => $credential->id,
                    'name' => $credential->name,
                    'created_at' => $credential->created_at,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function webAuthnAuthenticationOptions(Request $request)
    {
        $user = $request->user();
        $options = $this->webAuthnService->generateAuthenticationOptions($user);

        // Store options in session for verification
        session(['webauthn_request_options' => $options]);

        return response()->json($options);
    }

    public function webAuthnAuthenticate(Request $request)
    {
        $request->validate([
            'credential' => 'required|array',
        ]);

        $user = $request->user();
        $options = session('webauthn_request_options');

        if (!$options) {
            return response()->json(['error' => 'No authentication options found'], 400);
        }

        try {
            $credential = $this->webAuthnService->verifyAssertion(
                $user,
                $request->credential,
                $options
            );

            session()->forget('webauthn_request_options');

            return response()->json([
                'message' => 'Authentication successful',
                'credential' => $credential->name,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function removeWebAuthnCredential(Request $request)
    {
        $request->validate([
            'credential_id' => 'required|string',
            'password' => 'required|string',
        ]);

        $user = $request->user();

        if (!Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => 'The provided password is incorrect.',
            ]);
        }

        if ($this->webAuthnService->removeCredential($user, $request->credential_id)) {
            return redirect()->back()->with('success', 'Passkey removed successfully');
        }

        return redirect()->back()->with('error', 'Passkey not found');
    }
}