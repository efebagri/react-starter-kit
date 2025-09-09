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
    private ?Reader $asnReader = null;

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
            $asnDbPath = storage_path('app/geoip/GeoLite2-ASN.mmdb');

            if (file_exists($cityDbPath)) {
                $this->cityReader = new Reader($cityDbPath);
            }

            if (file_exists($countryDbPath)) {
                $this->countryReader = new Reader($countryDbPath);
            }

            if (file_exists($asnDbPath)) {
                $this->asnReader = new Reader($asnDbPath);
            }
        } catch (Exception $e) {
            Log::warning('Failed to initialize GeoIP readers: ' . $e->getMessage());
        }
    }

    /**
     * Get location information for an IP address.
     *
     * @param string $ip
     * @return array{city: string|null, country: string|null, country_code: string|null, error: string|null, success: bool}
     */
    public function getLocation(string $ip): array
    {
        // Default response
        $location = [
            'city' => null,
            'country' => null,
            'country_code' => null,
            'error' => null,
            'success' => false,
        ];

        // Validate IP format first
        if (!filter_var($ip, FILTER_VALIDATE_IP)) {
            $location['error'] = 'Invalid IP address format';
            return $location;
        }

        // Skip private/local IPs
        if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            $location['error'] = 'Private/local IP addresses are not supported for geolocation';
            return $location;
        }

        // Check cache first (cache for 1 hour) - use versioned cache key for new format
        $cacheKey = 'geoip_v2_' . md5($ip);
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        // Check if any database is available
        if ($this->cityReader === null && $this->countryReader === null) {
            $location['error'] = 'No GeoIP databases available';
            return $location;
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

            $location['success'] = true;
            
            // Cache the result for 1 hour
            Cache::put($cacheKey, $location, 3600);

        } catch (Exception $e) {
            Log::debug('GeoIP lookup failed for IP ' . $ip . ': ' . $e->getMessage());
            $location['error'] = 'GeoIP lookup failed: ' . $e->getMessage();
        }

        return $location;
    }

    /**
     * Get ASN (Autonomous System Number) information for an IP address.
     *
     * @param string $ip
     * @return array{asn: int|null, organization: string|null, error: string|null, success: bool}
     */
    public function getAsn(string $ip): array
    {
        // Default response
        $asnInfo = [
            'asn' => null,
            'organization' => null,
            'error' => null,
            'success' => false,
        ];

        // Validate IP format first
        if (!filter_var($ip, FILTER_VALIDATE_IP)) {
            $asnInfo['error'] = 'Invalid IP address format';
            return $asnInfo;
        }

        // Skip private/local IPs
        if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
            $asnInfo['error'] = 'Private/local IP addresses are not supported for ASN lookup';
            return $asnInfo;
        }

        // Check cache first (cache for 1 hour) - use versioned cache key for new format
        $cacheKey = 'asn_v2_' . md5($ip);
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        // Check if ASN database is available
        if ($this->asnReader === null) {
            $asnInfo['error'] = 'ASN database not available';
            return $asnInfo;
        }

        try {
            $record = $this->asnReader->asn($ip);
            
            $asnInfo['asn'] = $record->autonomousSystemNumber ?? null;
            $asnInfo['organization'] = $record->autonomousSystemOrganization ?? null;
            $asnInfo['success'] = true;

            // Cache the result for 1 hour
            Cache::put($cacheKey, $asnInfo, 3600);
        } catch (Exception $e) {
            Log::debug('ASN lookup failed for IP ' . $ip . ': ' . $e->getMessage());
            $asnInfo['error'] = 'ASN lookup failed: ' . $e->getMessage();
        }

        return $asnInfo;
    }

    /**
     * Get combined location and ASN information for an IP address.
     *
     * @param string $ip
     * @return array{city: string|null, country: string|null, country_code: string|null, asn: int|null, organization: string|null, error: string|null, success: bool}
     */
    public function getFullInfo(string $ip): array
    {
        $location = $this->getLocation($ip);
        $asn = $this->getAsn($ip);

        // If location lookup failed, return that error
        if (isset($location['error']) && $location['error'] !== null) {
            return [
                'city' => null,
                'country' => null,
                'country_code' => null,
                'asn' => null,
                'organization' => null,
                'error' => $location['error'],
                'success' => false,
            ];
        }

        // Merge results, prioritizing location success status
        $result = [
            'city' => $location['city'] ?? null,
            'country' => $location['country'] ?? null,
            'country_code' => $location['country_code'] ?? null,
            'asn' => $asn['asn'] ?? null,
            'organization' => $asn['organization'] ?? null,
            'error' => null,
            'success' => $location['success'] ?? false,
        ];

        // If ASN failed but location succeeded, add warning
        if (isset($asn['error']) && $asn['error'] !== null && ($location['success'] ?? false)) {
            $result['asn_warning'] = $asn['error'];
        }

        return $result;
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
     * @return array{city: bool, country: bool, asn: bool}
     */
    public function isDatabaseAvailable(): array
    {
        return [
            'city' => $this->cityReader !== null,
            'country' => $this->countryReader !== null,
            'asn' => $this->asnReader !== null,
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
            'asn' => [
                'available' => false,
                'path' => storage_path('app/geoip/GeoLite2-ASN.mmdb'),
                'exists' => file_exists(storage_path('app/geoip/GeoLite2-ASN.mmdb')),
            ],
        ];

        try {
            if ($this->cityReader !== null) {
                $info['city']['available'] = true;
            }
            if ($this->countryReader !== null) {
                $info['country']['available'] = true;
            }
            if ($this->asnReader !== null) {
                $info['asn']['available'] = true;
            }
        } catch (Exception $e) {
            Log::warning('Error getting database info: ' . $e->getMessage());
        }

        return $info;
    }
}