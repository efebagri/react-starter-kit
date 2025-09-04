import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Lock } from 'lucide-react';

import { NavFooter } from '@/components/elements/nav-footer';
import { NavUser } from '@/components/elements/nav-user';
import AppLogo from './app-logo';
import { type NavItem } from '@/types';
import { NavMain } from '@/components/elements/nav-main';

const appNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/app/dashboard',
        icon: LayoutGrid,
    },
];

// Admin-Navigation mit Submenüs
const adminNavItems: (NavItem & { children?: NavItem[] })[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
        icon: Lock,
    },
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { url } = usePage();
    const isAdmin = url.startsWith('/admin');
    const navItems = isAdmin ? adminNavItems : appNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/app/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
