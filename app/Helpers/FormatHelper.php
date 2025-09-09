<?php

namespace App\Helpers;

use DateTime;
use DateTimeZone;
use Exception;
use InvalidArgumentException;

class FormatHelper
{
    /**
     * Returns the symbol for a given ISO 4217 currency code.
     *
     * @param string $currency
     * @return string
     */
    public static function getCurrencySymbol(string $currency): string
    {
        return match (strtoupper($currency)) {
            'USD' => '$',
            'EUR' => '€',
            'GBP' => '£',
            'JPY', 'CNY' => '¥',
            'CHF' => 'CHF',
            'CAD' => 'C$',
            'AUD' => 'A$',
            'NZD' => 'NZ$',
            'HKD' => 'HK$',
            'SGD' => 'S$',
            'SEK', 'NOK', 'DKK', 'ISK' => 'kr',
            'PLN' => 'zł',
            'HUF' => 'Ft',
            'CZK' => 'Kč',
            'ILS' => '₪',
            'MXN', 'ARS', 'CLP', 'COP' => '$',
            'BRL' => 'R$',
            'RUB' => '₽',
            'ZAR' => 'R',
            'INR' => '₹',
            'KRW' => '₩',
            'THB' => '฿',
            'VND' => '₫',
            'PHP' => '₱',
            'IDR' => 'Rp',
            'MYR' => 'RM',
            'AED' => 'د.إ',
            'SAR' => '﷼',
            'TRY' => '₺',
            'EGP' => 'E£',
            'UAH' => '₴',
            'BGN' => 'лв',
            'RON' => 'lei',
            'HRK' => 'kn',
            'RSD' => 'дин.',
            'PKR' => '₨',
            'BDT' => '৳',
            'NGN' => '₦',
            'PEN' => 'S/',
            default => $currency,
        };
    }

    /**
     * Formats a money value with a symbol.
     *
     * @param float $amount
     * @param string $currency
     * @param bool $symbolBefore
     * @param int $decimals
     * @param string $decimalSeparator
     * @param string $thousandsSeparator
     * @return string
     */
    public static function formatMoneyWithSymbol(
        float $amount,
        string $currency = 'EUR',
        bool $symbolBefore = false,
        int $decimals = 2,
        string $decimalSeparator = '.',
        string $thousandsSeparator = ','
    ): string {
        $symbol = self::getCurrencySymbol($currency);
        $formatted = number_format($amount, $decimals, $decimalSeparator, $thousandsSeparator);

        return $symbolBefore ? $symbol . ' ' . $formatted : $formatted . ' ' . $symbol;
    }

    /**
     * Get the user's timezone preference.
     * Priority: browser timezone > user setting > app default
     *
     * @return string
     */
    private static function getUserTimezone(): string
    {
        // Try to get browser timezone from SystemHelper
        if (class_exists('App\Helpers\SystemHelper')) {
            $browserTimezone = SystemHelper::getBrowserTimezone();
            if ($browserTimezone) {
                return $browserTimezone;
            }
        }

        // Fallback to app timezone
        return config('app.timezone', 'UTC');
    }

    /**
     * Convert a DateTime to user's timezone.
     *
     * @param DateTime $date
     * @param string|null $timezone
     * @return DateTime
     */
    private static function convertToUserTimezone(DateTime $date, ?string $timezone = null): DateTime
    {
        $userTimezone = $timezone ?? self::getUserTimezone();

        try {
            return $date->setTimezone(new DateTimeZone($userTimezone));
        } catch (Exception) {
            // If the timezone is invalid, return the original date
            return $date;
        }
    }

    /**
     * Formats a DateTime object or string to a readable datetime format in the user's timezone.
     *
     * @param DateTime|string|null $date
     * @param string $dateFormat
     * @param string $timeFormat
     * @param string|null $timezone Optional specific timezone to use
     * @return string
     */
    public static function formatDateTime(DateTime|string|null $date, string $dateFormat = 'd.m.Y', string $timeFormat = 'H:i', ?string $timezone = null): string
    {
        if (!$date) return '';

        try {
            $dateObj = is_string($date) ? new DateTime($date) : $date;
            $dateObj = self::convertToUserTimezone($dateObj, $timezone);
            return $dateObj->format("$dateFormat $timeFormat");
        } catch (Exception) {
            return '';
        }
    }

    /**
     * Formats a date string or DateTime to date only in the user's timezone.
     *
     * @param DateTime|string|null $date
     * @param string $format
     * @param string|null $timezone Optional specific timezone to use
     * @return string
     */
    public static function formatDate(DateTime|string|null $date, string $format = 'd.m.Y', ?string $timezone = null): string
    {
        if (!$date) return '';

        try {
            $dateObj = is_string($date) ? new DateTime($date) : $date;
            $dateObj = self::convertToUserTimezone($dateObj, $timezone);
            return $dateObj->format($format);
        } catch (Exception) {
            return '';
        }
    }

    /**
     * Formats a DateTime or string to time in user's timezone.
     *
     * @param DateTime|string $date
     * @param string $format
     * @param string|null $timezone Optional specific timezone to use
     * @return string
     * @throws Exception
     */
    public static function formatTime(DateTime|string $date, string $format = 'H:i', ?string $timezone = null): string
    {
        $dateObj = is_string($date) ? new DateTime($date) : $date;
        $dateObj = self::convertToUserTimezone($dateObj, $timezone);
        return $dateObj->format($format);
    }

    /**
     * Formats a relative time (e.g., "2 hours ago") in user's timezone.
     *
     * @param DateTime|string|null $date
     * @param string|null $timezone Optional specific timezone to use
     * @return string
     */
    public static function formatRelativeTime(DateTime|string|null $date, ?string $timezone = null): string
    {
        if (!$date) return '';

        try {
            $dateObj = is_string($date) ? new DateTime($date) : $date;
            $dateObj = self::convertToUserTimezone($dateObj, $timezone);

            $now = new DateTime();
            $now = self::convertToUserTimezone($now, $timezone);

            $diff = $now->diff($dateObj);

            if ($diff->y > 0) {
                return $diff->y === 1 ? '1 year ago' : "{$diff->y} years ago";
            } elseif ($diff->m > 0) {
                return $diff->m === 1 ? '1 month ago' : "{$diff->m} months ago";
            } elseif ($diff->d > 0) {
                return $diff->d === 1 ? '1 day ago' : "{$diff->d} days ago";
            } elseif ($diff->h > 0) {
                return $diff->h === 1 ? '1 hour ago' : "{$diff->h} hours ago";
            } elseif ($diff->i > 0) {
                return $diff->i === 1 ? '1 minute ago' : "{$diff->i} minutes ago";
            } else {
                return 'just now';
            }
        } catch (Exception) {
            return '';
        }
    }

    /**
     * Get current DateTime in user's timezone.
     *
     * @param string|null $timezone Optional specific timezone to use
     * @return DateTime
     */
    public static function now(?string $timezone = null): DateTime
    {
        $userTimezone = $timezone ?? self::getUserTimezone();

        try {
            return new DateTime('now', new DateTimeZone($userTimezone));
        } catch (Exception) {
            return new DateTime(); // Fallback to server timezone
        }
    }

    /**
     * Formats a float as percent string.
     */
    public static function formatPercent(float $number, int $decimals = 2, string $decimalSeparator = ','): string
    {
        return number_format($number, $decimals, $decimalSeparator, '') . '%';
    }

    /**
     * Converts a value from a given unit to a human-readable format (e.g., 1024 B → 1.00 KB).
     */
    public static function formatFromUnit(
        float $value,
        string $unit = 'B',
        int $precision = 0,
        bool $isDecimalInput = true
    ): string {
        $units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
        $unit = strtoupper($unit);
        $baseIndex = array_search($unit, $units);

        if ($baseIndex === false) {
            throw new InvalidArgumentException("Unknown base unit: $unit");
        }

        $base = $isDecimalInput ? 1000 : 1024;
        $bytes = $value * pow($base, $baseIndex);
        $exponent = (int) floor(log($bytes, 1000));
        $exponent = min($exponent, count($units) - 1);

        return round($bytes / pow(1000, $exponent), $precision) . ' ' . $units[$exponent];
    }

    /**
     * Formats a German phone number.
     */
    public static function formatPhoneNumber(string $number, string $country = 'DE'): string
    {
        $number = preg_replace('/[^0-9]/', '', $number);

        if ($country === 'DE' && str_starts_with($number, '49')) {
            return '+' . substr($number, 0, 2) . ' ' . implode(' ', str_split(substr($number, 2), 4));
        }

        return $number;
    }

    /**
     * Formats a number as ordinal (e.g., 1 → 1.).
     */
    public static function formatOrdinal(int $number): string
    {
        return $number . '.';
    }

    /**
     * Formats a duration in seconds to human-readable format (e.g., 3661 → 1 H. 1 Min. 1 Sec.).
     */
    public static function formatDuration(int $seconds): string
    {
        if ($seconds < 60) {
            return $seconds . ' Sec.';
        }

        if ($seconds < 3600) {
            $minutes = floor($seconds / 60);
            $remaining = $seconds % 60;
            return $minutes . ' Min.' . ($remaining ? ' ' . $remaining . ' Sec.' : '');
        }

        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        return $hours . ' H.' . ($minutes ? ' ' . $minutes . ' Min.' : '');
    }

    /**
     * Formats an IBAN in grouped blocks.
     */
    public static function formatIBAN(string $iban): string
    {
        $iban = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $iban));
        return trim(chunk_split($iban, 4, ' '));
    }

    /**
     * Formats a credit card number in 4-digit blocks.
     */
    public static function formatCreditCard(string $number): string
    {
        $number = preg_replace('/[^0-9]/', '', $number);
        return implode(' ', str_split($number, 4));
    }
}
