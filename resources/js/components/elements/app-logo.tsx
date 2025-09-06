import React, { useEffect, useMemo, useState } from 'react';
import { useAppearance } from '@/hooks/use-appearance';

type Appearance = 'light' | 'dark' | 'system';

// Prefer the *actual* DOM theme first (data-theme / class="dark"), then appearance, then OS
function resolveIsDark(appearance: Appearance): boolean {
    if (typeof document !== 'undefined') {
        const html = document.documentElement;
        const dt = html.getAttribute('data-theme');
        const hasClass = html.classList.contains('dark');
        
        if (dt === 'dark') return true;
        if (dt === 'light') return false;
        if (hasClass) return true;
        
        // Also check body for dark class
        if (document.body.classList.contains('dark')) return true;
        
        // IMPORTANT: If we have DOM elements but no dark classes/attributes,
        // then we're definitely in light mode, regardless of appearance setting
        if (html.className !== undefined) {
            return false;
        }
    }
    
    if (appearance === 'dark') return true;
    if (appearance === 'light') return false;
    
    if (typeof window !== 'undefined') {
        return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
    }
    
    return false;
}

const AppLogo: React.FC = () => {
    const { appearance } = useAppearance();

    const [isDark, setIsDark] = useState<boolean>(() => {
        return resolveIsDark(appearance);
    });

    useEffect(() => {
        const checkTheme = () => {
            const currentIsDark = resolveIsDark(appearance);
            
            if (currentIsDark !== isDark) {
                setIsDark(currentIsDark);
            }
        };

        checkTheme();
        const intervalId = setInterval(checkTheme, 100);

        return () => {
            clearInterval(intervalId);
        };
    }, [appearance, isDark]);

    const src = useMemo(() => {
        return isDark ? '/assets/img/logos/dark.png' : '/assets/img/logos/light.png';
    }, [isDark]);

    return (
        <img
            key={`logo-${isDark ? 'dark' : 'light'}-${Date.now()}`}
            src={src}
            alt="Logo"
            className="w-50 h-auto ml-2"
            style={{ maxWidth: '200px' }}
        />
    );
};

export default AppLogo;
