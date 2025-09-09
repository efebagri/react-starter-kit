import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ===== DATE/TIME FORMATTING =====

/**
 * Mapping of timezones to locales
 */
const timezoneToLocaleMap: Record<string, string> = {
    // Europe
    'Europe/Berlin': 'de-DE',
    'Europe/Vienna': 'de-AT',
    'Europe/Zurich': 'de-CH',
    'Europe/Paris': 'fr-FR',
    'Europe/Rome': 'it-IT',
    'Europe/Madrid': 'es-ES',
    'Europe/Amsterdam': 'nl-NL',
    'Europe/London': 'en-GB',
    'Europe/Stockholm': 'sv-SE',
    'Europe/Oslo': 'nb-NO',
    'Europe/Copenhagen': 'da-DK',
    'Europe/Helsinki': 'fi-FI',
    'Europe/Warsaw': 'pl-PL',
    'Europe/Prague': 'cs-CZ',
    'Europe/Budapest': 'hu-HU',
    'Europe/Moscow': 'ru-RU',
    
    // Americas
    'America/New_York': 'en-US',
    'America/Chicago': 'en-US',
    'America/Denver': 'en-US',
    'America/Los_Angeles': 'en-US',
    'America/Toronto': 'en-CA',
    'America/Vancouver': 'en-CA',
    'America/Mexico_City': 'es-MX',
    'America/Sao_Paulo': 'pt-BR',
    'America/Buenos_Aires': 'es-AR',
    
    // Asia
    'Asia/Tokyo': 'ja-JP',
    'Asia/Seoul': 'ko-KR',
    'Asia/Shanghai': 'zh-CN',
    'Asia/Hong_Kong': 'zh-HK',
    'Asia/Singapore': 'en-SG',
    'Asia/Bangkok': 'th-TH',
    'Asia/Delhi': 'hi-IN',
    'Asia/Kolkata': 'hi-IN',
    'Asia/Dubai': 'ar-AE',
    
    // Australia/Oceania
    'Australia/Sydney': 'en-AU',
    'Australia/Melbourne': 'en-AU',
    'Pacific/Auckland': 'en-NZ',
};

/**
 * Mapping of country codes to locales (for IP-based fallback)
 */
const countryToLocaleMap: Record<string, string> = {
    'DE': 'de-DE',
    'AT': 'de-AT',
    'CH': 'de-CH',
    'FR': 'fr-FR',
    'IT': 'it-IT',
    'ES': 'es-ES',
    'NL': 'nl-NL',
    'GB': 'en-GB',
    'SE': 'sv-SE',
    'NO': 'nb-NO',
    'DK': 'da-DK',
    'FI': 'fi-FI',
    'PL': 'pl-PL',
    'CZ': 'cs-CZ',
    'HU': 'hu-HU',
    'RU': 'ru-RU',
    'US': 'en-US',
    'CA': 'en-CA',
    'MX': 'es-MX',
    'BR': 'pt-BR',
    'AR': 'es-AR',
    'JP': 'ja-JP',
    'KR': 'ko-KR',
    'CN': 'zh-CN',
    'HK': 'zh-HK',
    'SG': 'en-SG',
    'TH': 'th-TH',
    'IN': 'hi-IN',
    'AE': 'ar-AE',
    'AU': 'en-AU',
    'NZ': 'en-NZ',
};

/**
 * Get locale from timezone
 */
function getLocaleFromTimezone(timezone: string): string | null {
    return timezoneToLocaleMap[timezone] || null;
}

/**
 * Get locale from IP-based geolocation using our GeoLite2 backend service
 */
async function getLocaleFromIP(): Promise<string | null> {
    try {
        // Get IP location from our GeoLite2 backend service
        const response = await fetch('/api/geoip/location', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // Include CSRF token if available
                ...(document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') && {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')!.getAttribute('content')!
                })
            },
        });
        
        if (response.ok) {
            const data = await response.json();
            const countryCode = data.country_code;
            if (countryCode && countryToLocaleMap[countryCode]) {
                console.debug(`Detected locale from GeoLite2: ${countryToLocaleMap[countryCode]} (${countryCode})`);
                return countryToLocaleMap[countryCode];
            }
        } else {
            console.debug(`GeoLite2 API returned status: ${response.status}`);
        }
    } catch (error) {
        console.debug('Failed to get locale from GeoLite2 backend:', error);
    }
    return null;
}

// Global locale override (for testing/debugging)
let localeOverride: string | null = null;

/**
 * Override the detected locale (for testing/debugging)
 */
export function setLocaleOverride(locale: string | null): void {
    localeOverride = locale;
    console.log('Locale override set to:', locale);
}

/**
 * Get the user's browser locale with fallbacks (smart detection)
 */
function getBrowserLocale(): string {
    // Check for override first
    if (localeOverride) {
        return localeOverride;
    }
    
    const timezone = getBrowserTimezone();
    const localeFromTimezone = getLocaleFromTimezone(timezone);
    
    // Smart detection: If timezone suggests a specific locale and we have a matching language
    if (localeFromTimezone && navigator.languages) {
        const timezoneLanguage = localeFromTimezone.split('-')[0]; // 'de-DE' -> 'de'
        const hasMatchingLanguage = navigator.languages.some(lang => 
            lang.startsWith(timezoneLanguage)
        );
        
        if (hasMatchingLanguage) {
            return localeFromTimezone;
        }
    }
    
    // First try: Navigator language
    if (navigator.language && navigator.language !== 'undefined' && navigator.language !== '') {
        console.debug('Using navigator.language:', navigator.language);
        return navigator.language;
    }
    
    // Second try: First language in languages array
    if (navigator.languages && navigator.languages.length > 0 && 
        navigator.languages[0] !== 'undefined' && navigator.languages[0] !== '') {
        console.debug('Using navigator.languages[0]:', navigator.languages[0]);
        return navigator.languages[0];
    }
    
    // Third try: Get from timezone only
    if (localeFromTimezone) {
        console.debug('Using locale from timezone:', localeFromTimezone);
        return localeFromTimezone;
    }
    
    // Fourth try: Will be handled by async function
    // For sync functions, return default
    console.debug('Falling back to en-US');
    return 'en-US';
}

/**
 * Get the user's browser locale with full fallback chain (async)
 */
export async function getBrowserLocaleAsync(): Promise<string> {
    // First try: Navigator language
    if (navigator.language && navigator.language !== 'undefined') {
        return navigator.language;
    }
    
    // Second try: First language in languages array
    if (navigator.languages && navigator.languages.length > 0 && navigator.languages[0] !== 'undefined') {
        return navigator.languages[0];
    }
    
    // Third try: Get from timezone
    const timezone = getBrowserTimezone();
    const localeFromTimezone = getLocaleFromTimezone(timezone);
    if (localeFromTimezone) {
        return localeFromTimezone;
    }
    
    // Fourth try: Get from IP
    const localeFromIP = await getLocaleFromIP();
    if (localeFromIP) {
        return localeFromIP;
    }
    
    // Final fallback
    return 'en-US';
}

/**
 * Debug function to check locale settings (sync)
 */
export function getLocaleInfo(): {
    detected: string;
    languages: string[];
    timezone: string;
    sampleDate: string;
    sampleNumber: string;
    sampleCurrency: string;
    debug: {
        navigatorLanguage: string | undefined;
        navigatorLanguages: readonly string[] | undefined;
        timezoneMapping: string | null;
    };
} {
    const locale = getBrowserLocale();
    const now = new Date();
    const timezone = getBrowserTimezone();
    
    return {
        detected: locale,
        languages: navigator.languages ? Array.from(navigator.languages) : [navigator.language || 'unknown'],
        timezone,
        sampleDate: formatDateTime(now),
        sampleNumber: formatNumber(1234.56, 2),
        sampleCurrency: formatMoney(1234.56, 'EUR'),
        debug: {
            navigatorLanguage: navigator.language,
            navigatorLanguages: navigator.languages,
            timezoneMapping: getLocaleFromTimezone(timezone),
        },
    };
}

/**
 * Debug function to check locale settings with full fallback (async)
 */
export async function getLocaleInfoAsync(): Promise<{
    detected: string;
    languages: string[];
    timezone: string;
    fallbackUsed: 'navigator' | 'timezone' | 'ip' | 'default';
    sampleDate: string;
    sampleNumber: string;
    sampleCurrency: string;
}> {
    let fallbackUsed: 'navigator' | 'timezone' | 'ip' | 'default' = 'default';
    
    if (navigator.language && navigator.language !== 'undefined') {
        fallbackUsed = 'navigator';
    } else if (navigator.languages && navigator.languages.length > 0 && navigator.languages[0] !== 'undefined') {
        fallbackUsed = 'navigator';
    } else {
        const timezone = getBrowserTimezone();
        const localeFromTimezone = getLocaleFromTimezone(timezone);
        if (localeFromTimezone) {
            fallbackUsed = 'timezone';
        } else {
            const localeFromIP = await getLocaleFromIP();
            if (localeFromIP) {
                fallbackUsed = 'ip';
            }
        }
    }
    
    const locale = await getBrowserLocaleAsync();
    const now = new Date();
    
    return {
        detected: locale,
        languages: navigator.languages ? Array.from(navigator.languages) : [navigator.language || 'unknown'],
        timezone: getBrowserTimezone(),
        fallbackUsed,
        sampleDate: await formatDateTimeAsync(now),
        sampleNumber: await formatNumberAsync(1234.56, 2),
        sampleCurrency: await formatMoneyAsync(1234.56, 'EUR'),
    };
}

/**
 * Formats a date string or Date object to the user's local timezone and locale
 */
export function formatDateTime(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = getBrowserLocale();

    // Default formatting options - let browser decide AM/PM based on locale
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        // Remove hour12: false to let browser use locale preference
    };

    return dateObj.toLocaleString(locale, { ...defaultOptions, ...options });
}

/**
 * Formats a date string or Date object to the user's local timezone and locale (async with full fallback)
 */
export async function formatDateTimeAsync(date: string | Date, options?: Intl.DateTimeFormatOptions): Promise<string> {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = await getBrowserLocaleAsync();

    // Default formatting options - let browser decide AM/PM based on locale
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        // Remove hour12: false to let browser use locale preference
    };

    return dateObj.toLocaleString(locale, { ...defaultOptions, ...options });
}

/**
 * Formats a date to date only using browser locale
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = getBrowserLocale();

    // Let browser use locale-specific date format by default
    const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    };

    return dateObj.toLocaleDateString(locale, { ...defaultOptions, ...options });
}

/**
 * Formats a date to time only using browser locale (respects AM/PM preference)
 */
export function formatTime(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const locale = getBrowserLocale();

    // Let browser decide AM/PM vs 24-hour format based on locale
    const defaultOptions: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: '2-digit',
        // Remove hour12: false to let browser use locale preference
    };

    return dateObj.toLocaleTimeString(locale, { ...defaultOptions, ...options });
}

/**
 * Formats a date to a relative time string (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: string | Date): string {
    if (!date) return '';

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

    if (diffInSeconds < 60) {
        return 'just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return diffInMinutes === 1 ? '1 minute ago' : `${diffInMinutes} minutes ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
        return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return diffInMonths === 1 ? '1 month ago' : `${diffInMonths} months ago`;
    }

    const diffInYears = Math.floor(diffInMonths / 12);
    return diffInYears === 1 ? '1 year ago' : `${diffInYears} years ago`;
}

// ===== CURRENCY FORMATTING =====

/**
 * Returns the symbol for a given ISO 4217 currency code
 */
export function getCurrencySymbol(currency: string): string {
    const currencyMap: Record<string, string> = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'JPY': '¥',
        'CNY': '¥',
        'CHF': 'CHF',
        'CAD': 'C$',
        'AUD': 'A$',
        'NZD': 'NZ$',
        'HKD': 'HK$',
        'SGD': 'S$',
        'SEK': 'kr',
        'NOK': 'kr',
        'DKK': 'kr',
        'ISK': 'kr',
        'PLN': 'zł',
        'HUF': 'Ft',
        'CZK': 'Kč',
        'ILS': '₪',
        'MXN': '$',
        'ARS': '$',
        'CLP': '$',
        'COP': '$',
        'BRL': 'R$',
        'RUB': '₽',
        'ZAR': 'R',
        'INR': '₹',
        'KRW': '₩',
        'THB': '฿',
        'VND': '₫',
        'PHP': '₱',
        'IDR': 'Rp',
        'MYR': 'RM',
        'AED': 'د.إ',
        'SAR': '﷼',
        'TRY': '₺',
        'EGP': 'E£',
        'UAH': '₴',
        'BGN': 'лв',
        'RON': 'lei',
        'HRK': 'kn',
        'RSD': 'дин.',
        'PKR': '₨',
        'BDT': '৳',
        'NGN': '₦',
        'PEN': 'S/',
    };

    return currencyMap[currency.toUpperCase()] || currency;
}

/**
 * Formats a money value with currency using browser locale
 */
export function formatMoney(
    amount: number,
    currency: string = 'EUR',
    locale?: string
): string {
    const num = Number(amount);
    if (isNaN(num)) return '';

    // Use browser locale by default, allow override
    const actualLocale = locale || getBrowserLocale();
    return new Intl.NumberFormat(actualLocale, {
        style: 'currency',
        currency: currency.toUpperCase(),
    }).format(num);
}

/**
 * Formats a money value with currency using browser locale (async with full fallback)
 */
export async function formatMoneyAsync(
    amount: number,
    currency: string = 'EUR',
    locale?: string
): Promise<string> {
    const num = Number(amount);
    if (isNaN(num)) return '';

    // Use browser locale by default, allow override
    const actualLocale = locale || await getBrowserLocaleAsync();
    return new Intl.NumberFormat(actualLocale, {
        style: 'currency',
        currency: currency.toUpperCase(),
    }).format(num);
}

/**
 * Formats a money value with currency symbol (backward compatibility)
 */
export function formatMoneyWithSymbol(
    amount: number,
    currency: string = 'EUR',
    symbolBefore: boolean = false,
    decimals: number = 2,
    decimalSeparator: string = '.',
    thousandsSeparator: string = ','
): string {
    const symbol = getCurrencySymbol(currency);
    const formatted = formatNumberCustom(amount, decimals, decimalSeparator, thousandsSeparator);

    return symbolBefore ? `${symbol} ${formatted}` : `${formatted} ${symbol}`;
}

// ===== NUMBER FORMATTING =====

/**
 * Formats a number with specified decimal places using browser locale
 */
export function formatNumber(
    value: number,
    decimals: number = 0,
    locale?: string
): string {
    const num = Number(value);
    if (isNaN(num)) return '';

    // Use browser locale by default, allow override
    const actualLocale = locale || getBrowserLocale();
    return new Intl.NumberFormat(actualLocale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);
}

/**
 * Formats a number with specified decimal places using browser locale (async with full fallback)
 */
export async function formatNumberAsync(
    value: number,
    decimals: number = 0,
    locale?: string
): Promise<string> {
    const num = Number(value);
    if (isNaN(num)) return '';

    // Use browser locale by default, allow override
    const actualLocale = locale || await getBrowserLocaleAsync();
    return new Intl.NumberFormat(actualLocale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num);
}

/**
 * Formats a number with custom separators (for backward compatibility)
 */
export function formatNumberCustom(
    value: number,
    decimals: number = 0,
    decimalSeparator: string = '.',
    thousandsSeparator: string = ','
): string {
    const num = Number(value);
    if (isNaN(num)) return '';

    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num).replace(/,/g, thousandsSeparator).replace(/\./g, decimalSeparator);
}

/**
 * Formats a number as percentage using browser locale
 */
export function formatPercent(number: number, decimals: number = 2, locale?: string): string {
    const num = Number(number);
    if (isNaN(num)) return '';

    // Use browser locale by default, allow override
    const actualLocale = locale || getBrowserLocale();
    return new Intl.NumberFormat(actualLocale, {
        style: 'percent',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(num / 100); // Convert to decimal for percentage formatting
}

/**
 * Formats a number as ordinal (e.g., 1 → 1.)
 */
export function formatOrdinal(number: number): string {
    return number + '.';
}

// ===== BYTE FORMATTING =====

/**
 * Converts bytes to human-readable format (e.g., 1024 B → 1.00 KB)
 */
export function formatFromUnit(
    value: number,
    unit: string = 'B',
    precision: number = 0,
    isDecimalInput: boolean = true
): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const upperUnit = unit.toUpperCase();
    const baseIndex = units.indexOf(upperUnit);

    if (baseIndex === -1) {
        throw new Error(`Unknown base unit: ${unit}`);
    }

    const base = isDecimalInput ? 1000 : 1024;
    const bytes = value * Math.pow(base, baseIndex);
    const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1000)), units.length - 1);

    const result = bytes / Math.pow(1000, exponent);
    return `${result.toFixed(precision)} ${units[exponent]}`;
}

// ===== DURATION FORMATTING =====

/**
 * Formats duration in seconds to human-readable format
 */
export function formatDuration(seconds: number): string {
    if (seconds < 60) {
        return `${seconds} Sec.`;
    }

    if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        const remaining = seconds % 60;
        return `${minutes} Min.${remaining ? ` ${remaining} Sec.` : ''}`;
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} H.${minutes ? ` ${minutes} Min.` : ''}`;
}

// ===== STRING FORMATTING =====

/**
 * Formats a phone number (German format)
 */
export function formatPhoneNumber(number: string, country: string = 'DE'): string {
    const cleanNumber = number.replace(/[^0-9]/g, '');

    if (country === 'DE' && cleanNumber.startsWith('49')) {
        const chunks = cleanNumber.substring(2).match(/.{1,4}/g) || [];
        return `+${cleanNumber.substring(0, 2)} ${chunks.join(' ')}`;
    }

    return cleanNumber;
}

/**
 * Formats an IBAN in grouped blocks
 */
export function formatIBAN(iban: string): string {
    const cleanIban = iban.toUpperCase().replace(/[^A-Z0-9]/g, '');
    return cleanIban.match(/.{1,4}/g)?.join(' ') || cleanIban;
}

/**
 * Formats a credit card number in 4-digit blocks
 */
export function formatCreditCard(number: string): string {
    const cleanNumber = number.replace(/[^0-9]/g, '');
    return cleanNumber.match(/.{1,4}/g)?.join(' ') || cleanNumber;
}

// ===== SYSTEM DETECTION =====

/**
 * Get current browser timezone
 */
export function getBrowserTimezone(): string {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return 'UTC';
    }
}

/**
 * Get timezone offset in minutes
 */
export function getTimezoneOffset(): number {
    return new Date().getTimezoneOffset();
}

/**
 * Detect platform from user agent
 */
export function detectPlatform(userAgent: string = navigator.userAgent): string {
    const ua = userAgent.toLowerCase();

    if (ua.includes('linux')) return 'Linux';
    if (ua.includes('macintosh') || ua.includes('mac os x')) return 'macOS';
    if (ua.includes('windows') || ua.includes('win32')) return 'Windows';
    if (ua.includes('iphone')) return 'iOS';
    if (ua.includes('android')) return 'Android';

    return 'Unknown';
}

/**
 * Detect browser from user agent
 */
export function detectBrowser(userAgent: string = navigator.userAgent): string {
    const ua = userAgent.toLowerCase();

    if (ua.includes('msie') || ua.includes('trident')) return 'Internet Explorer';
    if (ua.includes('firefox')) return 'Firefox';
    if (ua.includes('chrome') && !ua.includes('edge')) return 'Chrome';
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
    if (ua.includes('edge')) return 'Edge';
    if (ua.includes('opera') || ua.includes('opr/')) return 'Opera';

    return 'Unknown';
}

/**
 * Detect device type from user agent
 */
export function detectDevice(userAgent: string = navigator.userAgent): string {
    const ua = userAgent.toLowerCase();

    if (ua.includes('mobile')) return 'Mobile';
    if (ua.includes('tablet')) return 'Tablet';

    return 'Desktop';
}

/**
 * Get basic client information
 */
export function getClientInfo(): {
    userAgent: string;
    platform: string;
    browser: string;
    device: string;
    timezone: string;
    language: string | null;
} {
    return {
        userAgent: navigator.userAgent,
        platform: detectPlatform(),
        browser: detectBrowser(),
        device: detectDevice(),
        timezone: getBrowserTimezone(),
        language: navigator.language || null,
    };
}

/**
 * Validate if a timezone string is valid
 */
export function validateTimezone(timezone: string): boolean {
    try {
        Intl.DateTimeFormat(undefined, { timeZone: timezone });
        return true;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
        return false;
    }
}

/**
 * Get timezone from offset minutes
 */
export function getTimezoneFromOffset(offsetMinutes: number): string {
    const offsetHours = -(offsetMinutes / 60);

    const timezoneMap: Record<number, string> = {
        '-12': 'Pacific/Wake',
        '-11': 'Pacific/Midway',
        '-10': 'Pacific/Honolulu',
        '-9': 'America/Anchorage',
        '-8': 'America/Los_Angeles',
        '-7': 'America/Denver',
        '-6': 'America/Chicago',
        '-5': 'America/New_York',
        '-4': 'America/Halifax',
        '-3': 'America/Sao_Paulo',
        '-2': 'Atlantic/South_Georgia',
        '-1': 'Atlantic/Azores',
        '0': 'UTC',
        '1': 'Europe/Berlin',
        '2': 'Europe/Helsinki',
        '3': 'Europe/Moscow',
        '4': 'Asia/Dubai',
        '5': 'Asia/Karachi',
        '6': 'Asia/Dhaka',
        '7': 'Asia/Bangkok',
        '8': 'Asia/Shanghai',
        '9': 'Asia/Tokyo',
        '10': 'Australia/Sydney',
        '11': 'Pacific/Guadalcanal',
        '12': 'Pacific/Auckland',
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return timezoneMap[Math.floor(offsetHours).toString()] || 'UTC';
}

// ===== COOKIE AND STORAGE HELPERS =====

/**
 * Set browser timezone in cookie
 */
export function setBrowserTimezoneCookie(): void {
    const timezone = getBrowserTimezone();
    const offset = getTimezoneOffset();

    document.cookie = `browser_timezone=${encodeURIComponent(timezone)}; path=/; max-age=86400`;
    document.cookie = `timezone_offset=${offset}; path=/; max-age=86400`;
}

/**
 * Initialize locale detection with full fallback chain
 * Call this when your app loads to cache the detected locale
 */
export async function initializeLocaleDetection(): Promise<{
    locale: string;
    method: 'navigator' | 'timezone' | 'ip' | 'default';
}> {
    let method: 'navigator' | 'timezone' | 'ip' | 'default' = 'default';
    
    if (navigator.language && navigator.language !== 'undefined') {
        method = 'navigator';
    } else if (navigator.languages && navigator.languages.length > 0 && navigator.languages[0] !== 'undefined') {
        method = 'navigator';
    } else {
        const timezone = getBrowserTimezone();
        const localeFromTimezone = getLocaleFromTimezone(timezone);
        if (localeFromTimezone) {
            method = 'timezone';
        } else {
            const localeFromIP = await getLocaleFromIP();
            if (localeFromIP) {
                method = 'ip';
            }
        }
    }
    
    const locale = await getBrowserLocaleAsync();
    
    // Store in session storage for faster access
    sessionStorage.setItem('detectedLocale', locale);
    sessionStorage.setItem('localeMethod', method);
    
    console.log(`Locale initialized: ${locale} (method: ${method})`);
    
    return { locale, method };
}
