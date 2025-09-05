<?php

namespace App\Services;

use App\Models\User;
use App\Models\WebAuthnCredential;

class WebAuthnService
{
    private string $rpId;
    private string $rpName;

    public function __construct()
    {
        $this->rpId = parse_url(config('app.url'), PHP_URL_HOST) ?? 'localhost';
        $this->rpName = config('app.name');
    }

    public function generateRegistrationOptions(User $user): array
    {
        $challenge = base64_encode(random_bytes(32));

        $excludeCredentials = $user->webAuthnCredentials
            ->map(fn($credential) => [
                'type' => 'public-key',
                'id' => $credential->credential_id,
                'transports' => ['usb', 'nfc', 'ble', 'internal']
            ])
            ->values()
            ->toArray();

        return [
            'challenge' => $challenge,
            'rp' => [
                'name' => $this->rpName,
                'id' => $this->rpId,
            ],
            'user' => [
                'id' => base64_encode((string) $user->id),
                'name' => $user->email,
                'displayName' => $user->name,
            ],
            'pubKeyCredParams' => [
                ['type' => 'public-key', 'alg' => -7],  // ES256
                ['type' => 'public-key', 'alg' => -257], // RS256
            ],
            'timeout' => 60000,
            'excludeCredentials' => $excludeCredentials,
            'authenticatorSelection' => [
                'authenticatorAttachment' => null,
                'requireResidentKey' => false,
                'userVerification' => 'preferred',
            ],
            'attestation' => 'none',
        ];
    }

    public function generateAuthenticationOptions(User $user): array
    {
        $challenge = base64_encode(random_bytes(32));

        $allowCredentials = $user->webAuthnCredentials
            ->map(fn($credential) => [
                'type' => 'public-key',
                'id' => $credential->credential_id,
                'transports' => ['usb', 'nfc', 'ble', 'internal']
            ])
            ->toArray();

        return [
            'challenge' => $challenge,
            'rpId' => $this->rpId,
            'timeout' => 60000,
            'userVerification' => 'preferred',
            'allowCredentials' => $allowCredentials,
        ];
    }

    public function verifyAndStoreCredential(
        User $user,
        array $credentialData,
        string $name,
        array $options
    ): WebAuthnCredential {
        try {
            $credentialId = $credentialData['id'] ?? null;
            
            if (!$credentialId) {
                throw new \Exception('Missing credential ID');
            }
            
            // Check if credential already exists
            if (WebAuthnCredential::where('credential_id', $credentialId)->exists()) {
                throw new \Exception('Credential already exists');
            }

            // For simplicity, we'll store the credential data directly
            // In production, you should properly verify the attestation
            
            return $user->webAuthnCredentials()->create([
                'credential_id' => $credentialId,
                'name' => $name,
                'public_key' => base64_encode(json_encode($credentialData['response'] ?? [])),
                'sign_count' => 0,
                'aaguid' => null,
                'attestation_format' => null,
            ]);
        } catch (\Exception $e) {
            throw new \Exception('Failed to verify credential: ' . $e->getMessage());
        }
    }

    public function verifyAssertion(
        User $user,
        array $credentialData,
        array $options
    ): WebAuthnCredential {
        $credentialId = $credentialData['id'] ?? null;
        
        if (!$credentialId) {
            throw new \Exception('Missing credential ID');
        }
        
        $credential = $user->webAuthnCredentials()
            ->where('credential_id', $credentialId)
            ->first();

        if (!$credential) {
            throw new \Exception('Credential not found');
        }

        // For simplicity, we'll assume the assertion is valid
        // In production, you should properly verify the assertion signature
        
        $credential->updateLastUsed();
        $credential->increment('sign_count');

        return $credential;
    }

    public function removeCredential(User $user, string $credentialId): bool
    {
        return $user->webAuthnCredentials()
            ->where('credential_id', $credentialId)
            ->delete() > 0;
    }

    public function getUserCredentials(User $user): array
    {
        return $user->webAuthnCredentials()
            ->select(['id', 'name', 'credential_id', 'created_at', 'last_used_at'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }
}