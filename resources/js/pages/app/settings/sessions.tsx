import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app/app-layout';
import SettingsLayout from '@/layouts/app/settings/layout';
import HeadingSmall from '@/components/heading-small';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { BreadcrumbItem } from '@/types';
import {
    Monitor,
    Smartphone,
    TabletSmartphone,
    Tv,
    LogOut,
    CheckCircle,
    MapPin,
    Clock,
    Globe,
} from 'lucide-react';
import { useState } from 'react';
import { formatDateTime } from '@/extensions/utils';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Sessions', href: '/app/settings/sessions' },
];

interface Session {
    id: string;
    ip_address: string;
    location: {
        city: string | null;
        country: string | null;
        country_code: string | null;
        formatted: string | null;
    };
    platform: string;
    browser: string;
    device_type: 'mobile' | 'tablet' | 'desktop' | 'tv';
    last_activity: string;
    is_current_device: boolean;
}

export default function Sessions() {
    const { sessions } = usePage<{ sessions: Session[] }>().props;
    const [showSignOutDialog, setShowSignOutDialog] = useState(false);
    const [sessionToSignOut, setSessionToSignOut] = useState<Session | null>(null);
    const [showSignOutAllDialog, setShowSignOutAllDialog] = useState(false);

    // Helper function to get location display
    const getLocationDisplay = (ipAddress: string, location: Session['location']): string => {
        // Check if it's a local IP address
        const localIpPatterns = [
            /^127\./,           // 127.x.x.x (loopback)
            /^192\.168\./,      // 192.168.x.x (private)
            /^10\./,            // 10.x.x.x (private)
            /^172\.(1[6-9]|2[0-9]|3[0-1])\./,  // 172.16-31.x.x (private)
            /^::1$/,            // IPv6 loopback
            /^fc00::/,          // IPv6 private
            /^fe80::/,          // IPv6 link-local
        ];

        const isLocalIp = localIpPatterns.some(pattern => pattern.test(ipAddress)) || 
                         ipAddress === 'localhost' || 
                         ipAddress === '::1';

        if (isLocalIp) {
            return 'Local Network';
        }

        return location?.formatted || 'Unknown Location';
    };

    // Helper function to calculate remaining session time (clientside)
    const getRemainingTime = (lastActivity: string): { text: string; color: string } => {
        const lastActivityDate = new Date(lastActivity);
        const now = new Date();
        const sessionLifetimeMs = 120 * 60 * 1000; // 120 minutes in milliseconds
        const expiresAt = new Date(lastActivityDate.getTime() + sessionLifetimeMs);
        const remainingMs = expiresAt.getTime() - now.getTime();
        
        if (remainingMs <= 0) {
            return { text: 'Expired', color: 'text-red-600 dark:text-red-400' };
        }
        
        const remainingMinutes = Math.floor(remainingMs / (1000 * 60));
        
        if (remainingMinutes < 60) {
            return { 
                text: `${remainingMinutes}m left`, 
                color: remainingMinutes <= 10 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'
            };
        }
        
        const hours = Math.floor(remainingMinutes / 60);
        const minutes = remainingMinutes % 60;
        return { 
            text: `${hours}h ${minutes}m left`, 
            color: 'text-green-600 dark:text-green-400'
        };
    };


    // Returns an icon based on the device type
    const deviceIcon = (type: Session['device_type']) => {
        switch (type) {
            case 'mobile':
                return <Smartphone className="h-5 w-5 mr-2 text-indigo-400" />;
            case 'tablet':
                return <TabletSmartphone className="h-5 w-5 mr-2 text-pink-400" />;
            case 'tv':
                return <Tv className="h-5 w-5 mr-2 text-yellow-400" />;
            default:
                return <Monitor className="h-5 w-5 mr-2 text-blue-400" />;
        }
    };

    // Handle sign out of a specific session
    const signOutSession = (session: Session) => {
        setSessionToSignOut(session);
        setShowSignOutDialog(true);
    };

    const confirmSignOut = () => {
        if (sessionToSignOut) {
            router.delete(route('sessions.destroy', sessionToSignOut.id), {
                preserveScroll: true,
            });
        }
        setShowSignOutDialog(false);
        setSessionToSignOut(null);
    };

    const signOutAllOthers = () => {
        router.post(route('sessions.destroy-others'), {}, {
            preserveScroll: true,
        });
        setShowSignOutAllDialog(false);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sessions" />
            <SettingsLayout>
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <HeadingSmall
                            title="Sessions"
                            description="View and manage your active sessions and connected devices."
                        />
                        {sessions.filter(s => !s.is_current_device).length > 0 && (
                            <Button
                                variant="outline"
                                onClick={() => setShowSignOutAllDialog(true)}
                                className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-300 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                <span className="font-medium">Sign out all others</span>
                            </Button>
                        )}
                    </div>


                    {/* Session list (no grid, stacked vertically) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                        {sessions.map((session) => (
                            <div
                                key={session.id}
                                className={`relative rounded-2xl border p-5 transition-all duration-200 bg-white dark:bg-zinc-900
                                    ${
                                    session.is_current_device
                                        ? 'border-indigo-500 ring-2 ring-indigo-400/30 dark:ring-indigo-500/20'
                                        : 'border-zinc-200 dark:border-zinc-700'
                                } hover:shadow-md`}
                            >
                                {/* Sign out button (if not the current device) */}
                                {!session.is_current_device && (
                                    <button
                                        onClick={() => signOutSession(session)}
                                        className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700 rounded hover:bg-red-200 dark:hover:bg-red-800 transition"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Sign Out
                                    </button>
                                )}

                                <div className="flex items-center flex-wrap gap-2 mb-3">
                                    {/* Device and browser info */}
                                    <div className="flex items-center">
                                        {deviceIcon(session.device_type)}
                                        <span className="text-sm font-semibold text-zinc-800 dark:text-white">
                                            {session.platform} – {session.browser}
                                        </span>
                                    </div>

                                    {/* Current device badge */}
                                    {session.is_current_device && (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 rounded-full">
                                            <CheckCircle className="h-4 w-4" />
                                            Current Device
                                        </span>
                                    )}
                                </div>

                                {/* Location, IP, timestamp + remaining time */}
                                <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                                    <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4 opacity-80" />
                                        <span>{getLocationDisplay(session.ip_address, session.location)}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 opacity-80" />
                                        <span>{session.ip_address}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 opacity-80" />
                                        <span>{formatDateTime(session.last_activity)}</span>
                                        <span className="text-zinc-400 dark:text-zinc-500">•</span>
                                        <span className={`text-xs font-medium ${getRemainingTime(session.last_activity).color}`}>
                                            {getRemainingTime(session.last_activity).text}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Sign Out Single Session Dialog */}
                <Dialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Sign out session?</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to end this session?
                                {sessionToSignOut && (
                                    <span className="block mt-2 font-medium">
                                        {sessionToSignOut.platform} – {sessionToSignOut.browser}
                                    </span>
                                )}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setShowSignOutDialog(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={confirmSignOut}>
                                Yes, sign out
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Sign Out All Others Dialog */}
                <Dialog open={showSignOutAllDialog} onOpenChange={setShowSignOutAllDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Sign out all other sessions?</DialogTitle>
                            <DialogDescription>
                                This will end all your active sessions on other devices. You will need to sign in again on those devices.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" onClick={() => setShowSignOutAllDialog(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={signOutAllOthers}>
                                Yes, sign out all
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </SettingsLayout>
        </AppLayout>
    );
}
