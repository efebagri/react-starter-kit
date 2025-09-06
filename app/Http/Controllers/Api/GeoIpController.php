<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\GeoIpService;
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
            return response()->json([
                'error' => 'Unable to determine client IP address',
            ], 400);
        }
        
        $location = $geoIpService->getLocation($clientIp);
        
        return response()->json([
            'ip' => $clientIp,
            'city' => $location['city'],
            'country' => $location['country'],
            'country_code' => $location['country_code'],
            'formatted' => $geoIpService->getFormattedLocation($clientIp),
        ]);
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
        $location = $geoIpService->getLocation($ip);
        
        return response()->json([
            'ip' => $ip,
            'city' => $location['city'],
            'country' => $location['country'],
            'country_code' => $location['country_code'],
            'formatted' => $geoIpService->getFormattedLocation($ip),
        ]);
    }
}
