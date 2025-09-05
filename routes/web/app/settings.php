<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Settings\SessionController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::redirect('settings', 'app/settings/profile');

Route::get('settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

Route::get('settings/password', [PasswordController::class, 'edit'])->name('password.edit');
Route::put('settings/password', [PasswordController::class, 'update'])->name('password.update');

Route::get('settings/sessions', [SessionController::class, 'index'])->name('session.get');
Route::delete('settings/sessions/{sessionId}', [SessionController::class, 'destroy'])->name('sessions.destroy');
Route::post('settings/sessions/destroy-others', [SessionController::class, 'destroyOthers'])->name('sessions.destroy-others');

Route::get('settings/security', [SecurityController::class, 'edit'])->name('security.edit');

// Two-Factor Authentication routes
Route::post('settings/security/two-factor/enable', [SecurityController::class, 'enableTwoFactor'])->name('two-factor.enable');
Route::post('settings/security/two-factor/confirm', [SecurityController::class, 'confirmTwoFactor'])->name('two-factor.confirm');
Route::delete('settings/security/two-factor/disable', [SecurityController::class, 'disableTwoFactor'])->name('two-factor.disable');
Route::post('settings/security/two-factor/recovery-codes', [SecurityController::class, 'regenerateRecoveryCodes'])->name('two-factor.recovery-codes');

// WebAuthn/Passkey routes
Route::post('settings/security/webauthn/register/options', [SecurityController::class, 'webAuthnRegisterOptions'])->name('webauthn.register.options');
Route::post('settings/security/webauthn/register', [SecurityController::class, 'webAuthnRegister'])->name('webauthn.register');
Route::post('settings/security/webauthn/authenticate/options', [SecurityController::class, 'webAuthnAuthenticationOptions'])->name('webauthn.authenticate.options');
Route::post('settings/security/webauthn/authenticate', [SecurityController::class, 'webAuthnAuthenticate'])->name('webauthn.authenticate');
Route::delete('settings/security/webauthn/credential', [SecurityController::class, 'removeWebAuthnCredential'])->name('webauthn.credential.remove');
