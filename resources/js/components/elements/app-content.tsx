import { useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { SidebarInset } from '@/components/ui/sidebar';
import type React from 'react';

interface AppContentProps extends React.ComponentProps<'main'> {
    variant?: 'header' | 'sidebar';
}

export function AppContent({ variant = 'header', children, ...props }: AppContentProps) {
    const { url } = usePage();
    const [transitionStage, setTransitionStage] = useState<'fadeIn' | 'fadeOut'>('fadeIn');

    useEffect(() => {
        setTransitionStage('fadeOut');
        const timeout = setTimeout(() => {
            setTransitionStage('fadeIn');
        }, 300);
        return () => clearTimeout(timeout);
    }, [url]);

    const content = (
        <div key={url} className={transitionStage}>
            {children}
        </div>
    );

    if (variant === 'sidebar') {
        return <SidebarInset {...props}>{content}</SidebarInset>;
    }

    return (
        <main className="mx-auto flex h-full w-full max-w-7xl flex-1 flex-col gap-4 rounded-xl" {...props}>
            {content}
        </main>
    );
}
