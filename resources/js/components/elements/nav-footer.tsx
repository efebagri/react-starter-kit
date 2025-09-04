import { Icon } from '@/components/icon';
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { type ComponentPropsWithoutRef } from 'react';

export function NavFooter({
    items,
    className,
    ...props
}: ComponentPropsWithoutRef<typeof SidebarGroup> & {
    items: NavItem[];
}) {
    const { state } = useSidebar();
    
    return (
        <div className="border-t border-sidebar-border/50 pt-3 pb-2">
            <SidebarGroup {...props} className={`group-data-[collapsible=icon]:p-0 ${className || ''}`}>
                <SidebarGroupContent>
                    <SidebarMenu className="space-y-1">
                        {items.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    tooltip={state === "collapsed" ? item.title : undefined}
                                    className="group relative mx-2 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/70 hover:text-sidebar-accent-foreground"
                                >
                                    <a href={item.href} target="_blank" rel="noopener noreferrer">
                                        {item.icon && (
                                            <Icon iconNode={item.icon} className="h-4 w-4 shrink-0 transition-colors" />
                                        )}
                                        <span className="truncate group-data-[collapsible=icon]:sr-only font-medium text-sm">
                                            {item.title}
                                        </span>
                                    </a>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>
        </div>
    );
}
