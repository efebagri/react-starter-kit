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
     *     device: string
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
        ];
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
