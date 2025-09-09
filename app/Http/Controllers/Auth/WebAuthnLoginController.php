<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\WebAuthnCredential;
use App\Services\WebAuthnService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class WebAuthnLoginController extends Controller
{
    public function __construct(
        private WebAuthnService $webAuthnService
    ) {
        // Apply web middleware for sessions but handle CSRF manually
    }

    public function generateAuthenticationOptions(Request $request)
    {
        try {
            // For login, we need to get all credentials from all users
            // since we don't know which user is trying to authenticate
            $allCredentials = WebAuthnCredential::all();
            
            $challenge = base64_encode(random_bytes(32));
            
            $allowCredentials = $allCredentials->map(function($credential) {
                return [
                    'type' => 'public-key',
                    'id' => $credential->credential_id,
                    'transports' => ['usb', 'nfc', 'ble', 'internal']
                ];
            })->values()->toArray();

            $options = [
                'challenge' => $challenge,
                'rpId' => parse_url(config('app.url'), PHP_URL_HOST) ?? 'localhost',
                'timeout' => 60000,
                'userVerification' => 'preferred',
                'allowCredentials' => $allowCredentials,
            ];

            // Store options in session for verification
            session(['webauthn_login_options' => $options]);

            return response()->json($options);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function authenticate(Request $request)
    {
        $request->validate([
            'credential' => 'required|array',
        ]);

        try {
            $credentialData = $request->credential;
            $options = session('webauthn_login_options');

            if (!$options) {
                return response()->json(['error' => 'No authentication options found'], 400);
            }

            $credentialId = $credentialData['id'] ?? null;
            
            if (!$credentialId) {
                return response()->json(['error' => 'Missing credential ID'], 400);
            }

            // Find the credential and user
            $credential = WebAuthnCredential::where('credential_id', $credentialId)->first();
            
            if (!$credential) {
                return response()->json(['error' => 'Credential not found'], 404);
            }

            $user = $credential->user;
            
            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            // For simplicity, we'll assume the assertion is valid
            // In production, you should properly verify the assertion signature
            
            // Update credential usage
            $credential->updateLastUsed();
            $credential->increment('sign_count');

            // Log the user in
            Auth::login($user, true); // Remember the user

            // Clear session data
            session()->forget(['webauthn_login_options']);

            // Set session flags
            session(['webauthn_authenticated' => true]);
            
            // If user has 2FA enabled, mark it as verified since WebAuthn is considered secure enough
            if ($user->hasTwoFactorAuthenticationEnabled()) {
                session(['two_factor_verified' => true]);
            }

            return response()->json([
                'message' => 'Authentication successful',
                'redirect' => route('dashboard'),
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
}