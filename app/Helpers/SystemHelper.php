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
     * Get browser timezone using modern JavaScript Intl.DateTimeFormat API.
     * This should be called with timezone string sent from frontend.
     *
     * @param string|null $browserTimezone
     * @return string|null
     */
    public static function getBrowserTimezone(?string $browserTimezone = null): ?string
    {
        // If timezone is provided directly from the browser (Intl.DateTimeFormat().resolvedOptions().timeZone)
        if ($browserTimezone) {
            return self::validateTimezone($browserTimezone);
        }

        // Check for browser timezone in request data
        if ($timezone = Request::input('browser_timezone')) {
            return self::validateTimezone($timezone);
        }

        // Check for browser timezone in the header
        if ($timezone = Request::header('X-Browser-Timezone')) {
            return self::validateTimezone($timezone);
        }

        // Check for browser timezone cookie
        if ($timezone = Request::cookie('browser_timezone')) {
            return self::validateTimezone($timezone);
        }

        return null;
    }

    /**
     * Validate if a timezone string is valid.
     *
     * @param string $timezone
     * @return string|null
     */
    public static function validateTimezone(string $timezone): ?string
    {
        try {
            new \DateTimeZone($timezone);
            return $timezone;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Generate JavaScript code to detect and send browser timezone.
     * This returns HTML with JavaScript to automatically detect timezone.
     *
     * @param string $method How to send timezone ('header', 'cookie', 'form', 'ajax')
     * @param string|null $endpoint Optional endpoint for AJAX method
     * @return string
     */
    public static function getTimezoneDetectionScript(string $method = 'cookie', ?string $endpoint = null): string
    {
        $script = "
        <script>
        (function() {
            try {
                // Get timezone using modern Intl API
                const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                const offset = new Date().getTimezoneOffset();

                console.log('Detected timezone:', timezone);
                console.log('Timezone offset:', offset);";

        switch ($method) {
            case 'cookie':
                $script .= "

                // Set timezone cookie
                document.cookie = 'browser_timezone=' + encodeURIComponent(timezone) + '; path=/; max-age=86400';
                document.cookie = 'timezone_offset=' + offset + '; path=/; max-age=86400';";
                break;

            case 'header':
                $script .= "

                // Set timezone header for future requests (intercept fetch)
                if (typeof fetch !== 'undefined' && !window.__timezoneInterceptorInstalled) {
                    const originalFetch = window.fetch;
                    window.fetch = function(...args) {
                        let options = args[1] || {};
                        if (typeof options === 'object') {
                            options.headers = options.headers || {};
                            options.headers['X-Browser-Timezone'] = timezone;
                            options.headers['X-Timezone-Offset'] = offset.toString();
                        }
                        args[1] = options;
                        return originalFetch.apply(this, args);
                    };
                    window.__timezoneInterceptorInstalled = true;
                }";
                break;

            case 'ajax':
                $endpoint = $endpoint ?: '/api/set-timezone';
                $script .= "

                // Send timezone via AJAX
                if (typeof fetch !== 'undefined') {
                    const csrfToken = document.querySelector('meta[name=\"csrf-token\"]')?.getAttribute('content');
                    fetch('{$endpoint}', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            ...(csrfToken && { 'X-CSRF-TOKEN': csrfToken })
                        },
                        body: JSON.stringify({
                            timezone: timezone,
                            offset: offset
                        })
                    })
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to set timezone: ' + response.status);
                        }
                        console.log('Timezone sent successfully');
                    })
                    .catch(error => {
                        console.warn('Failed to send timezone:', error);
                    });
                }";
                break;

            case 'form':
                $script .= "

                // Add hidden inputs to all forms
                document.addEventListener('DOMContentLoaded', function() {
                    const forms = document.querySelectorAll('form');
                    forms.forEach(function(form) {
                        if (!form.querySelector('input[name=\"browser_timezone\"]')) {
                            const timezoneInput = document.createElement('input');
                            timezoneInput.type = 'hidden';
                            timezoneInput.name = 'browser_timezone';
                            timezoneInput.value = timezone;
                            form.appendChild(timezoneInput);

                            const offsetInput = document.createElement('input');
                            offsetInput.type = 'hidden';
                            offsetInput.name = 'timezone_offset';
                            offsetInput.value = offset.toString();
                            form.appendChild(offsetInput);
                        }
                    });
                });";
                break;
        }

        $script .= "
            } catch (error) {
                console.warn('Timezone detection failed:', error);
            }
        })();
        </script>";

        return $script;
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
