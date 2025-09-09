<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TwoFactorAuthentication extends Model
{
    use LogsActivity;

    protected $table = 'two_factor_authentication';

    protected $fillable = [
        'user_id',
        'secret',
        'recovery_codes',
        'confirmed_at',
    ];

    protected $casts = [
        'recovery_codes' => 'array',
        'confirmed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isConfirmed(): bool
    {
        return !is_null($this->confirmed_at);
    }

    public function markAsConfirmed(): void
    {
        $this->confirmed_at = now();
        $this->save();
    }
}
