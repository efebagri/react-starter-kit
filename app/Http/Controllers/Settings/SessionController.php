<?php

namespace App\Http\Controllers\Settings;

use App\Helpers\FormatHelper;
use App\Http\Controllers\Controller;
use App\Services\GeoIpService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class SessionController extends Controller
{
    private function getPlatformBadge(string $ua): string
    {
        $ua = strtolower($ua);
        return str_contains($ua, 'windows') ? 'Windows' :
            (str_contains($ua, 'macintosh') ? 'macOS' :
                (str_contains($ua, 'linux') ? 'Linux' :
                    (str_contains($ua, 'iphone') ? 'iOS' :
                        (str_contains($ua, 'android') ? 'Android' : 'Unknown'))));
    }

    private function getBrowserBadge(string $ua): string
    {
        $ua = strtolower($ua);
        return str_contains($ua, 'chrome') && !str_contains($ua, 'edge') ? 'Chrome' :
            (str_contains($ua, 'firefox') ? 'Firefox' :
                (str_contains($ua, 'safari') && !str_contains($ua, 'chrome') ? 'Safari' :
                    (str_contains($ua, 'edge') ? 'Edge' :
                        (str_contains($ua, 'opera') || str_contains($ua, 'opr/') ? 'Opera' : 'Unknown'))));
    }

    public function index(GeoIpService $geoIpService)
    {
        $userId = Auth::id();

        $sessions = DB::table('sessions')
            ->where('user_id', $userId)
            ->orderByDesc('last_activity')
            ->get()
            ->map(function ($session) use ($geoIpService) {
                $ua = strtolower($session->user_agent);

                $deviceType = str_contains($ua, 'smart-tv') || str_contains($ua, 'tv')
                    ? 'tv'
                    : (str_contains($ua, 'tablet') ? 'tablet'
                        : (str_contains($ua, 'mobile') ? 'mobile' : 'desktop'));

                // Get location information for the IP address
                $location = $geoIpService->getLocation($session->ip_address ?? '');

                return [
                    'id' => $session->id,
                    'ip_address' => $session->ip_address ?? 'Unknown',
                    'location' => [
                        'city' => $location['city'],
                        'country' => $location['country'],
                        'country_code' => $location['country_code'],
                        'formatted' => $geoIpService->getFormattedLocation($session->ip_address ?? ''),
                    ],
                    'platform' => $this->getPlatformBadge($ua),
                    'browser' => $this->getBrowserBadge($ua),
                    'device_type' => $deviceType,
                    'user_agent' => $session->user_agent,
                    'last_activity' => Carbon::createFromTimestamp($session->last_activity)->toISOString(),
                    'is_current_device' => $session->id === session()->getId(),
                ];
            });

        return Inertia::render('app/settings/sessions', [
            'sessions' => $sessions,
        ]);
    }

    public function destroy(Request $request, $sessionId)
    {
        $userId = Auth::id();
        $currentSessionId = session()->getId();

        // Prevent deleting current session
        if ($sessionId === $currentSessionId) {
            return redirect()->back()->with('error', 'Cannot delete current session');
        }

        // Delete the specific session
        DB::table('sessions')
            ->where('id', $sessionId)
            ->where('user_id', $userId)
            ->delete();

        return redirect()->back()->with('success', 'Session successfully signed out');
    }

    public function destroyOthers(Request $request)
    {
        $userId = Auth::id();
        $currentSessionId = session()->getId();

        // Delete all sessions except the current one
        DB::table('sessions')
            ->where('user_id', $userId)
            ->where('id', '!=', $currentSessionId)
            ->delete();

        return redirect()->back()->with('success', 'All other sessions successfully signed out');
    }
}
