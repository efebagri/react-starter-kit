import { AppContent } from '@/components/elements/app-content';
import { AppShell } from '@/components/elements/app-shell';
import { HomepageHeader } from '@/components/home/homepage-header';
import { type PropsWithChildren } from 'react';

export default function HomepageHeaderLayout({ children }: PropsWithChildren) {
    return (
        <AppShell variant="header">
            <HomepageHeader />
            <AppContent variant="header" className="overflow-x-hidden">
                {children}
            </AppContent>
        </AppShell>
    );
}
