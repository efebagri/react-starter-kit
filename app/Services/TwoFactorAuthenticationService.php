<?php

namespace App\Services;

use App\Models\User;
use App\Models\TwoFactorAuthentication;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorAuthenticationService
{
    public function __construct(
        private Google2FA $google2fa
    ) {
    }

    public function generateSecretKey(): string
    {
        return $this->google2fa->generateSecretKey();
    }

    public function generateQrCode(User $user, string $secret): string
    {
        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );

        $renderer = new ImageRenderer(
            new RendererStyle(400),
            new SvgImageBackEnd()
        );

        $writer = new Writer($renderer);

        return $writer->writeString($qrCodeUrl);
    }

    public function verifyCode(string $secret, string $code): bool
    {
        return $this->google2fa->verifyKey($secret, $code);
    }

    public function generateRecoveryCodes(): array
    {
        $codes = [];
        for ($i = 0; $i < 10; $i++) {
            $codes[] = strtoupper(substr(str_shuffle('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'), 0, 8));
        }
        return $codes;
    }

    public function enableTwoFactorAuthentication(User $user): TwoFactorAuthentication
    {
        $secret = $this->generateSecretKey();
        $recoveryCodes = $this->generateRecoveryCodes();

        return $user->twoFactorAuthentication()->create([
            'secret' => $secret,
            'recovery_codes' => $recoveryCodes,
        ]);
    }

    public function confirmTwoFactorAuthentication(User $user, string $code): bool
    {
        $twoFactor = $user->twoFactorAuthentication;

        if (!$twoFactor) {
            return false;
        }

        if ($this->verifyCode($twoFactor->secret, $code)) {
            $twoFactor->markAsConfirmed();
            return true;
        }

        return false;
    }

    public function disableTwoFactorAuthentication(User $user): void
    {
        $user->twoFactorAuthentication()?->delete();
    }

    public function verifyRecoveryCode(User $user, string $recoveryCode): bool
    {
        $twoFactor = $user->twoFactorAuthentication;

        if (!$twoFactor || !$twoFactor->isConfirmed()) {
            return false;
        }

        $recoveryCodes = $twoFactor->recovery_codes;
        $recoveryCode = strtoupper($recoveryCode);

        if (in_array($recoveryCode, $recoveryCodes)) {
            // Remove used recovery code
            $recoveryCodes = array_values(array_diff($recoveryCodes, [$recoveryCode]));
            $twoFactor->update(['recovery_codes' => $recoveryCodes]);
            return true;
        }

        return false;
    }

    public function regenerateRecoveryCodes(User $user): array
    {
        $twoFactor = $user->twoFactorAuthentication;

        if (!$twoFactor) {
            throw new \Exception('Two-factor authentication is not enabled');
        }

        $newRecoveryCodes = $this->generateRecoveryCodes();
        $twoFactor->update(['recovery_codes' => $newRecoveryCodes]);

        return $newRecoveryCodes;
    }
}