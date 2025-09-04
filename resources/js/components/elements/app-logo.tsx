import React, { useEffect, useMemo, useState } from 'react';
import AssetImage from '../ui/assets-image';
import { useAppearance } from '@/hooks/use-appearance';

type Appearance = 'light' | 'dark' | 'system';

// Prefer the *actual* DOM theme first (data-theme / class="dark"), then appearance, then OS
function resolveIsDark(appearance: Appearance): boolean {
    if (typeof document !== 'undefined') {
        const html = document.documentElement;
        const dt = html.getAttribute('data-theme');
        if (dt === 'dark') return true;
        if (dt === 'light') return false;
        if (html.classList.contains('dark')) return true;
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

    const [isDark, setIsDark] = useState<boolean>(() => resolveIsDark(appearance));

    // Update when app-level appearance changes (e.g. user picks light/dark/system)
    useEffect(() => {
        setIsDark(resolveIsDark(appearance));
    }, [appearance]);

    // Live updates:
    // - OS theme changes (only relevant when using system)
    // - <html> mutations: class="dark" / data-theme="dark"
    // - localStorage changes from other tabs/windows
    useEffect(() => {
        if (typeof window === 'undefined' || typeof document === 'undefined') return;

        const mql = window.matchMedia?.('(prefers-color-scheme: dark)');
        const onMqlChange = () => setIsDark(resolveIsDark(appearance));
        mql?.addEventListener('change', onMqlChange);

        const html = document.documentElement;
        const mo = new MutationObserver(() => setIsDark(resolveIsDark(appearance)));
        mo.observe(html, { attributes: true, attributeFilter: ['class', 'data-theme'] });

        const onStorage = (e: StorageEvent) => {
            if (e.key === 'appearance') setIsDark(resolveIsDark((e.newValue as Appearance | null) ?? 'system'));
        };
        window.addEventListener('storage', onStorage);

        return () => {
            mql?.removeEventListener('change', onMqlChange);
            mo.disconnect();
            window.removeEventListener('storage', onStorage);
        };
    }, [appearance]);

    // Intentionally inverted: dark UI -> light logo, light UI -> dark logo
    const src = useMemo(
        () => (isDark ? '/assets/img/logos/light.png' : '/assets/img/logos/dark.png'),
        [isDark]
    );

    return (
        <AssetImage
            key={isDark ? 'logo-dark-ui' : 'logo-light-ui'} // force remount if your AssetImage memorizes
            src={src}
            alt="Logo"
            className="w-50 h-auto ml-2"
        />
    );
};

export default AppLogo;
