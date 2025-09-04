<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
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

    public function index()
    {
        $userId = Auth::id();

        $sessions = DB::table('sessions')
            ->where('user_id', $userId)
            ->orderByDesc('last_activity')
            ->get()
            ->map(function ($session) {
                $ua = strtolower($session->user_agent);

                $deviceType = str_contains($ua, 'smart-tv') || str_contains($ua, 'tv')
                    ? 'tv'
                    : (str_contains($ua, 'tablet') ? 'tablet'
                        : (str_contains($ua, 'mobile') ? 'mobile' : 'desktop'));

                return [
                    'id' => $session->id,
                    'ip_address' => $session->ip_address ?? 'Unbekannt',
                    'platform' => $this->getPlatformBadge($ua),
                    'browser' => $this->getBrowserBadge($ua),
                    'device_type' => $deviceType,
                    'user_agent' => $session->user_agent,
                    'last_activity' => Carbon::createFromTimestamp($session->last_activity)->isoFormat('DD/MM/YYYY, HH:mm [GMT]Z'),
                    'is_current_device' => $session->id === session()->getId(),
                ];
            });

        return Inertia::render('app/settings/sessions', [
            'sessions' => $sessions,
        ]);
    }
}
