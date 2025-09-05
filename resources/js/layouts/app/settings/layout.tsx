import Heading from '@/components/heading';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/extensions/utils';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

const sidebarNavItems: NavItem[] = [
    { title: 'Profile', href: '/app/settings/profile', icon: null },
    { title: 'Password', href: '/app/settings/password', icon: null },
    { title: 'Security', href: '/app/settings/security', icon: null },
    { title: 'Sessions', href: '/app/settings/sessions', icon: null },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
    if (typeof window === 'undefined') return null;

    const currentPath = window.location.pathname;

    return (
        <div className="px-6 py-8 max-w-6xl mx-auto text-zinc-900 dark:text-white">
            <div className="mb-8">
                <Heading title="Settings" description="Manage your profile and account preferences" />
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full max-w-[200px]">
                    <nav className="space-y-2">
                        {sidebarNavItems.map((item) => {
                            const isActive = currentPath === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        'block rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                        isActive
                                            ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 border-l-4 border-indigo-600 pl-2'
                                            : 'text-zinc-600 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-white'
                                    )}
                                >
                                    {item.title}
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                <Separator className="md:hidden" />

                {/* Main Content */}
                <main className="flex-1">
                    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm p-6 space-y-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
