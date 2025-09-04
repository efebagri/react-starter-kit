import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app/app-layout';
import SettingsLayout from '@/layouts/app/settings/layout';
import HeadingSmall from '@/components/heading-small';
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
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Sessions', href: '/app/settings/sessions' },
];

interface Session {
    id: string;
    ip_address: string;
    platform: string;
    browser: string;
    device_type: 'mobile' | 'tablet' | 'desktop' | 'tv';
    last_activity: string;
    is_current_device: boolean;
}

export default function Sessions() {
    const { sessions } = usePage<{ sessions: Session[] }>().props;

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
    const signOutSession = (id: string) => {
        if (confirm('Do you really want to sign out from this session?')) {
            router.delete(route('sessions.destroy', id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sessions" />
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Sessions"
                        description="View and manage your active sessions and connected devices."
                    />

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
                                {/* Sign out button (if not current device) */}
                                {!session.is_current_device && (
                                    <button
                                        onClick={() => signOutSession(session.id)}
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

                                {/* IP + timestamp */}
                                <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-300">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 opacity-80" />
                                        <span>{session.ip_address}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 opacity-80" />
                                        <span>{session.last_activity}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
