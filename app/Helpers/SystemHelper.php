<?php

namespace App\Helpers;

use Illuminate\Support\Facades\Request;

class SystemHelper
{
    /**
     * Get basic client information including IP address, user agent, platform, browser, and device type.
     *
     * @return array{
     *     ip_address: string|null,
     *     user_agent: string,
     *     platform: string,
     *     browser: string,
     *     device: string,
     *     timezone: string|null,
     *     language: string|null
     * }
     */
    public static function getClientInfo(): array
    {
        $userAgent = Request::header('User-Agent') ?? 'unknown';

        return [
            'ip_address' => Request::ip(),
            'user_agent' => $userAgent,
            'platform'   => self::detectPlatform($userAgent),
            'browser'    => self::detectBrowser($userAgent),
            'device'     => self::detectDevice($userAgent),
            'timezone'   => self::detectTimezone(),
            'language'   => self::detectLanguage(),
        ];
    }

    /**
     * Get client timezone from various sources.
     * This requires JavaScript to send the timezone via request header or cookie.
     *
     * @return string|null
     */
    public static function detectTimezone(): ?string
    {
        // Check for a custom timezone header (set by JavaScript)
        if ($timezone = Request::header('X-Client-Timezone')) {
            return $timezone;
        }

        // Check for timezone cookie (set by JavaScript)
        if ($timezone = Request::cookie('client_timezone')) {
            return $timezone;
        }

        // Fallback to IP-based timezone detection (approximate)
        return self::getTimezoneByIP(Request::ip());
    }

    /**
     * Get timezone based on IP address (approximate).
     * This is a fallback method and not 100% accurate.
     *
     * @param string|null $ip
     * @return string|null
     */
    public static function getTimezoneByIP(?string $ip): ?string
    {
        if (!$ip || $ip === '127.0.0.1' || filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE) === false) {
            return config('app.timezone'); // Fallback to app timezone for local/private IPs
        }

        // Simple IP-based timezone mapping (very basic)
        // In production, you might want to use a service like ipinfo.io or maxmind
        try {
            // This is a basic implementation - you might want to integrate with a real IP geolocation service
            $geoData = @file_get_contents("http://ip-api.com/json/{$ip}?fields=timezone");
            if ($geoData) {
                $data = json_decode($geoData, true);
                return $data['timezone'] ?? null;
            }
        } catch (\Exception $e) {
            // Silently fail and use fallback
        }

        return null;
    }

    /**
     * Detect client language from Accept-Language header.
     *
     * @return string|null
     */
    public static function detectLanguage(): ?string
    {
        $acceptLanguage = Request::header('Accept-Language');

        if (!$acceptLanguage) {
            return null;
        }

        // Parse Accept-Language header to get primary language
        $languages = explode(',', $acceptLanguage);
        $primaryLanguage = trim(explode(';', $languages[0])[0]);

        return $primaryLanguage;
    }

    /**
     * Get the client timezone offset in minutes from JavaScript.
     * This should be called with data sent from the frontend.
     *
     * @param int|null $offsetMinutes
     * @return string|null
     */
    public static function getTimezoneFromOffset(?int $offsetMinutes): ?string
    {
        if ($offsetMinutes === null) {
            return null;
        }

        // Convert offset minutes to timezone string
        // Note: JavaScript getTimezoneOffset() returns offset in reverse (UTC - local time)
        $offsetHours = -($offsetMinutes / 60);

        // Simple mapping of common offsets to timezones
        return match ((int) $offsetHours) {
            -12 => 'Pacific/Wake',
            -11 => 'Pacific/Midway',
            -10 => 'Pacific/Honolulu',
            -9 => 'America/Anchorage',
            -8 => 'America/Los_Angeles',
            -7 => 'America/Denver',
            -6 => 'America/Chicago',
            -5 => 'America/New_York',
            -4 => 'America/Halifax',
            -3 => 'America/Sao_Paulo',
            -2 => 'Atlantic/South_Georgia',
            -1 => 'Atlantic/Azores',
            0 => 'UTC',
            1 => 'Europe/Berlin',
            2 => 'Europe/Helsinki',
            3 => 'Europe/Moscow',
            4 => 'Asia/Dubai',
            5 => 'Asia/Karachi',
            6 => 'Asia/Dhaka',
            7 => 'Asia/Bangkok',
            8 => 'Asia/Shanghai',
            9 => 'Asia/Tokyo',
            10 => 'Australia/Sydney',
            11 => 'Pacific/Guadalcanal',
            12 => 'Pacific/Auckland',
            default => 'UTC',
        };
    }

    /**
     * Detect the operating system platform based on the User-Agent string.
     *
     * @param string $userAgent
     * @return string
     */
    protected static function detectPlatform(string $userAgent): string
    {
        return match (true) {
            preg_match('/linux/i', $userAgent)             => 'Linux',
            preg_match('/macintosh|mac os x/i', $userAgent) => 'macOS',
            preg_match('/windows|win32/i', $userAgent)     => 'Windows',
            default                                        => 'Unknown',
        };
    }

    /**
     * Detect the web browser from the User-Agent string.
     *
     * @param string $userAgent
     * @return string
     */
    protected static function detectBrowser(string $userAgent): string
    {
        return match (true) {
            preg_match('/msie|trident/i', $userAgent)   => 'Internet Explorer',
            preg_match('/firefox/i', $userAgent)        => 'Firefox',
            preg_match('/chrome/i', $userAgent)         => 'Chrome',
            preg_match('/safari/i', $userAgent)         => 'Safari',
            preg_match('/opera|opr/i', $userAgent)      => 'Opera',
            default                                      => 'Unknown',
        };
    }

    /**
     * Detect the device type from the User-Agent string.
     *
     * @param string $userAgent
     * @return string
     */
    protected static function detectDevice(string $userAgent): string
    {
        return match (true) {
            preg_match('/mobile/i', $userAgent) => 'Mobile',
            preg_match('/tablet/i', $userAgent) => 'Tablet',
            default                             => 'Desktop',
        };
    }
}
