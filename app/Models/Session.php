<?php

namespace App\Models;

use App\Traits\LogsActivity;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Session extends Model
{
    use LogsActivity;

    protected $table = 'sessions';

    protected $primaryKey = 'id';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'user_id',
        'ip_address',
        'user_agent',
        'payload',
        'last_activity',
    ];

    /**
     * @return string
     */
    public function getPlatformBadgeAttribute(): string
    {
        $ua = strtolower($this->user_agent);

        return match (true) {
            str_contains($ua, 'windows') => 'Windows',
            str_contains($ua, 'macintosh') => 'macOS',
            str_contains($ua, 'linux') => 'Linux',
            str_contains($ua, 'iphone') => 'iOS',
            str_contains($ua, 'android') => 'Android',
            default => 'Unknown',
        };
    }

    /**
     * @return string
     */
    public function getBrowserBadgeAttribute(): string
    {
        $ua = strtolower($this->user_agent);

        return match (true) {
            str_contains($ua, 'chrome') && !str_contains($ua, 'edge') => 'Chrome',
            str_contains($ua, 'firefox') => 'Firefox',
            str_contains($ua, 'safari') && !str_contains($ua, 'chrome') => 'Safari',
            str_contains($ua, 'edge') => 'Edge',
            str_contains($ua, 'opera') || str_contains($ua, 'opr/') => 'Opera',
            default => 'Unknown',
        };
    }

    /**
     * @return string
     */
    public function getDeviceBadgeAttribute(): string
    {
        $ua = strtolower($this->user_agent);

        return match (true) {
            str_contains($ua, 'mobile') => 'Mobile',
            str_contains($ua, 'tablet') => 'Tablet',
            default => 'Desktop',
        };
    }

    /**
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
}
