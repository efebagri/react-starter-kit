// NavMain.tsx
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, useSidebar } from '@/components/ui/sidebar';
import type { NavSection } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, ExternalLink, Dot } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@radix-ui/react-collapsible';

type Props = {
    sections: NavSection[];
    accordionSections?: boolean; // nur 1 Sektion offen
    accordionParents?: boolean; // nur 1 Parent pro Sektion offen
};

export function NavMain({ sections = [], accordionSections = false, accordionParents = false }: Props) {
    const page = usePage();
    const { state } = useSidebar();
    const permissions = (page.props as { permissions?: string[] }).permissions || [];
    const [openItems, setOpenItems] = useState<Record<string, boolean>>({});

    // Initialize open state for active items
    useEffect(() => {
        const initialOpen: Record<string, boolean> = {};
        sections.forEach((section) => {
            section.items.forEach((item) => {
                if (item.children?.some((child) => page.url.startsWith(child.href))) {
                    initialOpen[item.title] = true;
                }
            });
        });
        setOpenItems(initialOpen);
    }, [sections, page.url]);

    return (
        <div className="flex flex-col gap-2 py-2">
            {sections.map((section, sectionIndex) => (
                <div key={section.label}>
                    {sectionIndex > 0 && (
                        <div className="mx-4 border-t border-sidebar-border/50 dark:border-sidebar-border/20" />
                    )}
                    
                    <SidebarGroup className="py-0">
                        <div className="px-4 py-2">
                            <SidebarGroupLabel className="text-xs font-semibold tracking-wide text-sidebar-foreground/60 dark:text-sidebar-foreground/40 uppercase mb-2 group-data-[collapsible=icon]:sr-only">
                                {section.label}
                            </SidebarGroupLabel>
                        </div>
                        
                        <SidebarMenu className="space-y-1">
                            {section.items.map((item) => {
                                const hasChildren = !!item.children?.length;
                                const visibleChildren = useMemo(
                                    () => (item.children ?? []).filter((c) => !c.permission || permissions.includes(c.permission)),
                                    [permissions, item.children],
                                );
                                
                                const isActive = page.url.startsWith(item.href);
                                const hasActiveChild = visibleChildren.some((child) => page.url.startsWith(child.href));
                                const itemIsActive = isActive || hasActiveChild;
                                
                                if (!hasChildren || visibleChildren.length === 0) {
                                    const isExternal = !!item.external || /^https?:\/\//.test(item.href);
                                    const linkProps = isExternal ? { target: '_blank', rel: 'noreferrer' } : {};
                                    
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton 
                                                asChild 
                                                isActive={isActive}
                                                tooltip={state === "collapsed" ? item.title : undefined}
                                                className="group relative mx-2 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-medium"
                                            >
                                                <Link href={item.href} {...linkProps}>
                                                    {item.icon && (
                                                        <item.icon className="h-4 w-4 shrink-0 transition-colors" />
                                                    )}
                                                    <span className="truncate group-data-[collapsible=icon]:sr-only">
                                                        {item.title}
                                                    </span>
                                                    {item.badge && (
                                                        <span className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-md bg-sidebar-primary/10 px-1.5 text-xs font-medium text-sidebar-primary group-data-[collapsible=icon]:sr-only">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                    {isExternal && (
                                                        <ExternalLink className="ml-auto h-3 w-3 shrink-0 opacity-60 group-data-[collapsible=icon]:sr-only" />
                                                    )}
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                }

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <Collapsible
                                            open={openItems[item.title]}
                                            onOpenChange={(open) =>
                                                setOpenItems((prev) => ({ ...prev, [item.title]: open }))
                                            }
                                        >
                                            <CollapsibleTrigger asChild>
                                                <SidebarMenuButton 
                                                    isActive={itemIsActive}
                                                    tooltip={state === "collapsed" ? item.title : undefined}
                                                    className="group relative mx-2 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-medium"
                                                >
                                                    {item.icon && (
                                                        <item.icon className="h-4 w-4 shrink-0 transition-colors" />
                                                    )}
                                                    <span className="truncate group-data-[collapsible=icon]:sr-only">
                                                        {item.title}
                                                    </span>
                                                    {item.badge && (
                                                        <span className="ml-auto inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-md bg-sidebar-primary/10 px-1.5 text-xs font-medium text-sidebar-primary group-data-[collapsible=icon]:sr-only">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                    <ChevronDown className="ml-auto h-3 w-3 shrink-0 transition-transform group-data-[collapsible=icon]:sr-only data-[state=open]:rotate-180" />
                                                </SidebarMenuButton>
                                            </CollapsibleTrigger>
                                            
                                            <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
                                                <SidebarMenuSub className="ml-4 border-l border-sidebar-border/20 pl-4">
                                                    {visibleChildren.map((child) => {
                                                        const childIsActive = page.url.startsWith(child.href);
                                                        const isExternal = !!child.external || /^https?:\/\//.test(child.href);
                                                        const linkProps = isExternal ? { target: '_blank', rel: 'noreferrer' } : {};
                                                        
                                                        return (
                                                            <SidebarMenuSubItem key={child.title}>
                                                                <SidebarMenuSubButton
                                                                    asChild
                                                                    isActive={childIsActive}
                                                                    className="group relative px-3 py-2 rounded-md transition-all duration-200 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent/70 data-[active=true]:text-sidebar-accent-foreground data-[active=true]:font-medium"
                                                                >
                                                                    <Link href={child.href} {...linkProps}>
                                                                        <Dot className="h-3 w-3 shrink-0 opacity-60" />
                                                                        <span className="truncate">
                                                                            {child.title}
                                                                        </span>
                                                                        {child.badge && (
                                                                            <span className="ml-auto inline-flex h-4 min-w-[1rem] items-center justify-center rounded px-1 text-xs font-medium text-sidebar-primary bg-sidebar-primary/10">
                                                                                {child.badge}
                                                                            </span>
                                                                        )}
                                                                        {isExternal && (
                                                                            <ExternalLink className="ml-auto h-3 w-3 shrink-0 opacity-50" />
                                                                        )}
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        );
                                                    })}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                </div>
            ))}
        </div>
    );
}
