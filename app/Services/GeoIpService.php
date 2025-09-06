<?php

namespace App\Services;

use GeoIp2\Database\Reader;
use Exception;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class GeoIpService
{
    private ?Reader $cityReader = null;
    private ?Reader $countryReader = null;

    public function __construct()
    {
        $this->initializeReaders();
    }

    /**
     * Initialize the GeoIP database readers.
     */
    private function initializeReaders(): void
    {
        try {
            $cityDbPath = storage_path('app/geoip/GeoLite2-City.mmdb');
            $countryDbPath = storage_path('app/geoip/GeoLite2-Country.mmdb');

            if (file_exists($cityDbPath)) {
                $this->cityReader = new Reader($cityDbPath);
            }

            if (file_exists($countryDbPath)) {
                $this->countryReader = new Reader($countryDbPath);
            }
        } catch (Exception $e) {
            Log::warning('Failed to initialize GeoIP readers: ' . $e->getMessage());
        }
    }

    /**
     * Get location information for an IP address.
     *
     * @param string $ip
     * @return array{city: string|null, country: string|null, country_code: string|null}
     */
    public function getLocation(string $ip): array
    {
        // Default response
        $location = [
            'city' => null,
            'country' => null,
            'country_code' => null,
        ];

        // Skip private/local IPs
        if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            return $location;
        }

        // Check cache first (cache for 1 hour)
        $cacheKey = 'geoip_' . md5($ip);
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            // Try city database first (more detailed)
            if ($this->cityReader !== null) {
                $record = $this->cityReader->city($ip);
                
                $location['city'] = $record->city->name ?? null;
                $location['country'] = $record->country->name ?? null;
                $location['country_code'] = $record->country->isoCode ?? null;
            } 
            // Fallback to country database
            elseif ($this->countryReader !== null) {
                $record = $this->countryReader->country($ip);
                
                $location['country'] = $record->country->name ?? null;
                $location['country_code'] = $record->country->isoCode ?? null;
            }

            // Cache the result for 1 hour
            Cache::put($cacheKey, $location, 3600);

        } catch (Exception $e) {
            Log::debug('GeoIP lookup failed for IP ' . $ip . ': ' . $e->getMessage());
        }

        return $location;
    }

    /**
     * Get a formatted location string for display.
     *
     * @param string $ip
     * @return string|null
     */
    public function getFormattedLocation(string $ip): ?string
    {
        $location = $this->getLocation($ip);

        if ($location['city'] && $location['country']) {
            return $location['city'] . ', ' . $location['country'];
        }

        if ($location['country']) {
            return $location['country'];
        }

        return null;
    }

    /**
     * Check if GeoIP databases are available.
     *
     * @return array{city: bool, country: bool}
     */
    public function isDatabaseAvailable(): array
    {
        return [
            'city' => $this->cityReader !== null,
            'country' => $this->countryReader !== null,
        ];
    }

    /**
     * Get database information.
     *
     * @return array
     */
    public function getDatabaseInfo(): array
    {
        $info = [
            'city' => [
                'available' => false,
                'path' => storage_path('app/geoip/GeoLite2-City.mmdb'),
                'exists' => file_exists(storage_path('app/geoip/GeoLite2-City.mmdb')),
            ],
            'country' => [
                'available' => false,
                'path' => storage_path('app/geoip/GeoLite2-Country.mmdb'),
                'exists' => file_exists(storage_path('app/geoip/GeoLite2-Country.mmdb')),
            ],
        ];

        try {
            if ($this->cityReader !== null) {
                $info['city']['available'] = true;
            }
            if ($this->countryReader !== null) {
                $info['country']['available'] = true;
            }
        } catch (Exception $e) {
            Log::warning('Error getting database info: ' . $e->getMessage());
        }

        return $info;
    }
}