import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
} from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

export function NavMain({ items = [] }: { items: (NavItem & { children?: NavItem[] })[] }) {
    const page = usePage();
    const isAdmin = page.url.startsWith('/admin');
    const permissions = (page.props as { permissions?: string[] }).permissions || [];

    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const initialState: Record<string, boolean> = {};
        items.forEach((item) => {
            if (item.children?.some((child) => page.url.startsWith(child.href))) {
                initialState[item.title] = true;
            }
        });
        setOpenMenus(initialState);
    }, [page.url]);

    const toggleMenu = (title: string) => {
        setOpenMenus((prev) => ({
            ...prev,
            [title]: !prev[title],
        }));
    };

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>{isAdmin ? 'Admin Bereich' : 'Plattform'}</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => {
                    const hasChildren = Array.isArray(item.children) && item.children.length > 0;
                    const visibleChildren = (item.children ?? []).filter(
                        (child) => !child.permission || permissions.includes(child.permission)
                    );

                    const submenuIsOpen = openMenus[item.title] ?? false;
                    const hasActiveChild = visibleChildren.some((child) => page.url.startsWith(child.href));

                    if (hasChildren && visibleChildren.length > 0) {
                        return (
                            <div key={item.title} className="w-full">
                                <SidebarMenuItem>
                                    <button
                                        onClick={() => toggleMenu(item.title)}
                                        className={`flex items-center w-full px-3 py-2 gap-2 text-left rounded-lg transition-all
                                            ${hasActiveChild
                                            ? 'bg-indigo-50 dark:bg-zinc-800/50 font-semibold text-indigo-600 dark:text-white'
                                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-100'}
                                        `}
                                    >
                                        {item.icon && <item.icon className="h-5 w-5" />}
                                        <span className="flex-1">{item.title}</span>
                                        <ChevronDown
                                            className={`h-4 w-4 transform transition-transform duration-200 ${
                                                submenuIsOpen ? 'rotate-180' : ''
                                            }`}
                                        />
                                    </button>
                                </SidebarMenuItem>

                                {submenuIsOpen && (
                                    <div className="ml-4 mt-1 pl-2 border-l border-zinc-200 dark:border-zinc-700 space-y-1">
                                        {visibleChildren.map((child) => {
                                            const isActive = page.url.startsWith(child.href);
                                            return (
                                                <SidebarMenuItem key={child.title}>
                                                    <SidebarMenuButton
                                                        asChild
                                                        isActive={isActive}
                                                    >
                                                        <Link
                                                            href={child.href}
                                                            className={`block px-3 py-1.5 rounded-md text-sm font-medium transition-all
                                                                ${isActive
                                                                ? 'bg-indigo-600 text-white shadow'
                                                                : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'}
                                                            `}
                                                        >
                                                            {child.title}
                                                        </Link>
                                                    </SidebarMenuButton>
                                                </SidebarMenuItem>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    }

                    if (!item.permission || permissions.includes(item.permission)) {
                        const isActive = page.url.startsWith(item.href);
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    tooltip={{ children: item.title }}
                                >
                                    <Link
                                        href={item.href}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all
                                            ${isActive
                                            ? 'bg-indigo-600 text-white shadow'
                                            : 'text-zinc-800 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'}
                                        `}
                                    >
                                        {item.icon && <item.icon className="h-5 w-5" />}
                                        <span>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    }

                    return null;
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
