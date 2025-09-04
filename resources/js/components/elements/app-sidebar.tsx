import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, usePage } from "@inertiajs/react";
import { BookOpen, Folder, LayoutGrid, Lock, Users, Shield, Settings, Layers, LifeBuoy, FileText } from "lucide-react";

import { NavFooter } from "@/components/elements/nav-footer";
import { NavUser } from "@/components/elements/nav-user";
import AppLogo from "./app-logo";
import type { NavItem, NavSection } from "@/types";
import { NavMain } from "@/components/elements/nav-main";

const appSections: NavSection[] = [
    {
        label: "Produkte",
        items: [
            { title: "Dashboard", href: "/app/dashboard", icon: LayoutGrid },
            {
                title: "Projects",
                href: "/app/projects",
                icon: Layers,
                children: [
                    { title: "All Projects", href: "/app/projects" },
                    { title: "My Projects", href: "/app/projects/mine" },
                    { title: "Create Project", href: "/app/projects/create", permission: "projects:create", badge: "New" },
                ],
            },
        ],
    },
    {
        label: "Support",
        items: [
            { title: "Docs", href: "https://laravel.com/docs/starter-kits#react", icon: FileText, external: true },
            { title: "Help Center", href: "/app/support", icon: LifeBuoy },
        ],
    },
];

const adminSections: NavSection[] = [
    {
        label: "Übersicht",
        items: [{ title: "Admin Dashboard", href: "/admin/dashboard", icon: Lock }],
    },
    {
        label: "Benutzer & Rechte",
        items: [
            {
                title: "User Management",
                href: "/admin/users",
                icon: Users,
                children: [
                    { title: "Users", href: "/admin/users", permission: "users:view" },
                    { title: "Roles", href: "/admin/roles", permission: "roles:view" },
                    { title: "Permissions", href: "/admin/permissions", permission: "permissions:view" },
                ],
            },
            {
                title: "Security",
                href: "/admin/security",
                icon: Shield,
                children: [
                    { title: "Audit Logs", href: "/admin/audit-logs", permission: "audit_logs:view" },
                    { title: "Sessions", href: "/admin/sessions", permission: "sessions:view" },
                ],
            },
        ],
    },
    {
        label: "System",
        items: [
            {
                title: "System Settings",
                href: "/admin/settings",
                icon: Settings,
                children: [
                    { title: "General", href: "/admin/settings/general", permission: "settings:view" },
                    { title: "Licenses", href: "/admin/settings/licenses", permission: "settings:view" },
                ],
            },
        ],
    },
];

const footerNavItems: NavItem[] = [
    { title: "Repository", href: "https://github.com/laravel/react-starter-kit", icon: Folder, external: true },
    { title: "Documentation", href: "https://laravel.com/docs/starter-kits#react", icon: BookOpen, external: true },
];

export function AppSidebar() {
    const { url } = usePage();
    const isAdmin = url.startsWith("/admin");
    const sections = isAdmin ? adminSections : appSections;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="border-b border-sidebar-border/50">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Link
                            href="/app/dashboard"
                            prefetch
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                        >
                            <AppLogo />
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain sections={sections} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
