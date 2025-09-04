import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { UserInfo } from '@/components/elements/user-info';
import { UserMenuContent } from '@/components/elements/user-menu-content';
import { useIsMobile } from '@/hooks/use-mobile';
import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { ChevronsUpDown } from 'lucide-react';

export function NavUser() {
    const { auth } = usePage<SharedData>().props;
    const { state } = useSidebar();
    const isMobile = useIsMobile();

    return (
        <div className="mt-auto border-t border-sidebar-border/50 pt-4 pb-2">
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                tooltip={state === "collapsed" ? `${auth.user.name} (${auth.user.email})` : undefined}
                                className="group relative mx-2 px-3 py-3 rounded-xl transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border border-sidebar-border/50 hover:border-sidebar-border/80 data-[state=open]:border-sidebar-primary/30 hover:shadow-sm data-[state=open]:shadow-md backdrop-blur-sm bg-sidebar/50 dark:bg-sidebar/30"
                            >
                                <UserInfo user={auth.user} />
                                <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity group-data-[collapsible=icon]:sr-only" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-64 rounded-xl border-sidebar-border/50 bg-sidebar/95 backdrop-blur-md shadow-xl"
                            align="start"
                            side={isMobile ? 'top' : state === 'collapsed' ? 'right' : 'top'}
                            sideOffset={8}
                        >
                            <UserMenuContent user={auth.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </div>
    );
}
