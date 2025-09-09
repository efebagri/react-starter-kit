<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebAuthnCredential extends Model
{
    use LogsActivity;

    protected $table = 'webauthn_credentials';

    protected $fillable = [
        'user_id',
        'credential_id',
        'name',
        'public_key',
        'sign_count',
        'aaguid',
        'attestation_format',
        'last_used_at',
    ];

    protected $casts = [
        'last_used_at' => 'datetime',
        'sign_count' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function updateLastUsed(): void
    {
        $this->last_used_at = now();
        $this->save();
    }
}
