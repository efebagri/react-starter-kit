import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/elements/user-info';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { type User } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import { LockKeyhole, Box, LogOut, Settings } from 'lucide-react';
import AppearanceTabs from '@/components/elements/appearance-tabs';

interface UserMenuContentProps {
    user: User;
}

export function UserMenuContent({ user }: UserMenuContentProps) {
    const cleanup = useMobileNavigation();
    const { props, url } = usePage<{ permissions: string[] }>();
    const appName = String(props.name ?? 'Laravel');
    const hasAdminAccess = props.permissions.includes('view_admin_panel');
    const isAdminPanel = url.startsWith('/admin');

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>

                <div className="flex justify-center pt-2">
                    <AppearanceTabs type="onlyIcon" />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            {hasAdminAccess && (
                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        {isAdminPanel ? (
                            <Link
                                className="block w-full"
                                href={route('dashboard')}
                                as="button"
                                prefetch
                                onClick={cleanup}
                            >
                                <Box className="mr-2" />
                                {appName}
                            </Link>
                        ) : (
                            <Link
                                className="block w-full"
                                href={route('admin.dashboard')}
                                as="button"
                                prefetch
                                onClick={cleanup}
                            >
                                <LockKeyhole className="mr-2" />
                                Admin
                            </Link>
                        )}
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            )}

            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full"
                        href={route('profile.edit')}
                        as="button"
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        Settings
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
                <Link
                    className="block w-full"
                    method="post"
                    href={route('logout')}
                    as="button"
                    onClick={handleLogout}
                >
                    <LogOut className="mr-2" />
                    Log out
                </Link>
            </DropdownMenuItem>
        </>
    );
}
