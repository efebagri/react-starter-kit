// Load Tailwind (or your own) styles
import '../css/app.css';

// Load i18n localization setup
import '@/extensions/i18n';

// React 18 root API
import { createRoot } from 'react-dom/client';

// Inertia core
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

// Appearance hook (for dark/light mode on an initial load)
import { initializeTheme } from './hooks/use-appearance';

// Create the Inertia application
createInertiaApp({
    // Dynamically set the document title using the app name from Laravel
    title: (title) => {
        // Access Laravel-shared props from the Inertia bootstrap data
        const pageData = document.getElementById('app')?.dataset?.page;
        let appName = 'dev_ng'; // default fallback

        if (pageData) {
            try {
                const parsed = JSON.parse(pageData);
                appName = parsed.props?.name ?? 'dev_ng';
            } catch (e) {
                console.warn('Unable to read app name from shared props:', e);
            }
        }

        return `${title} × ${appName}`;
    },

    // Dynamically import all page components from the pages/ directory
    resolve: (name) =>
        resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),

    // Setup function renders the application
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },

    // Inertia progress bar config (shown during navigation)
    progress: {
        color: '#4B5563', // Tailwind Gray-600
    },
});

// Initialize dark/light mode according to system or saved preference
initializeTheme();
