<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GeoIpService;
use App\Helpers\APIResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class GeoIpController extends Controller
{
    /**
     * Get location information for the client's IP address.
     *
     * @param Request $request
     * @param GeoIpService $geoIpService
     * @return JsonResponse
     */
    public function getLocation(Request $request, GeoIpService $geoIpService): JsonResponse
    {
        $clientIp = $request->ip();
        
        if (!$clientIp) {
            return APIResponse::badRequest('Unable to determine client IP address');
        }
        
        $fullInfo = $geoIpService->getFullInfo($clientIp);
        
        $data = [
            'ip' => $clientIp,
            'city' => $fullInfo['city'] ?? null,
            'country' => $fullInfo['country'] ?? null,
            'country_code' => $fullInfo['country_code'] ?? null,
            'asn' => $fullInfo['asn'] ?? null,
            'organization' => $fullInfo['organization'] ?? null,
            'formatted' => ($fullInfo['success'] ?? false) ? $geoIpService->getFormattedLocation($clientIp) : null,
        ];

        // Add ASN warning if present
        if (isset($fullInfo['asn_warning'])) {
            $data['asn_warning'] = $fullInfo['asn_warning'];
        }

        // Return success or error response
        if ($fullInfo['success'] ?? false) {
            return APIResponse::success($data, 'GeoIP lookup successful');
        } else {
            $errorMessage = $fullInfo['error'] ?? 'GeoIP lookup failed';
            return APIResponse::badRequest($errorMessage);
        }
    }
    
    /**
     * Get location information for a specific IP address.
     *
     * @param Request $request
     * @param GeoIpService $geoIpService
     * @return JsonResponse
     */
    public function getLocationForIp(Request $request, GeoIpService $geoIpService): JsonResponse
    {
        $request->validate([
            'ip' => 'required|ip',
        ]);
        
        $ip = $request->input('ip');
        $fullInfo = $geoIpService->getFullInfo($ip);
        
        $data = [
            'ip' => $ip,
            'city' => $fullInfo['city'] ?? null,
            'country' => $fullInfo['country'] ?? null,
            'country_code' => $fullInfo['country_code'] ?? null,
            'asn' => $fullInfo['asn'] ?? null,
            'organization' => $fullInfo['organization'] ?? null,
            'formatted' => ($fullInfo['success'] ?? false) ? $geoIpService->getFormattedLocation($ip) : null,
        ];

        // Add ASN warning if present
        if (isset($fullInfo['asn_warning'])) {
            $data['asn_warning'] = $fullInfo['asn_warning'];
        }

        // Return success or error response
        if ($fullInfo['success'] ?? false) {
            return APIResponse::success($data, 'GeoIP lookup successful');
        } else {
            $errorMessage = $fullInfo['error'] ?? 'GeoIP lookup failed';
            return APIResponse::badRequest($errorMessage);
        }
    }

    /**
     * Get ASN information for a specific IP address.
     *
     * @param Request $request
     * @param GeoIpService $geoIpService
     * @return JsonResponse
     */
    public function getAsnForIp(Request $request, GeoIpService $geoIpService): JsonResponse
    {
        $request->validate([
            'ip' => 'required|ip',
        ]);
        
        $ip = $request->input('ip');
        $asnInfo = $geoIpService->getAsn($ip);
        
        $data = [
            'ip' => $ip,
            'asn' => $asnInfo['asn'] ?? null,
            'organization' => $asnInfo['organization'] ?? null,
        ];

        // Return success or error response
        if ($asnInfo['success'] ?? false) {
            return APIResponse::success($data, 'ASN lookup successful');
        } else {
            $errorMessage = $asnInfo['error'] ?? 'ASN lookup failed';
            return APIResponse::badRequest($errorMessage);
        }
    }
}
