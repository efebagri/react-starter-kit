import { createInertiaApp } from '@inertiajs/react';
import createServer from '@inertiajs/react/server';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ReactDOMServer from 'react-dom/server';
import { type RouteName, route } from 'ziggy-js';

createServer((page) =>
    createInertiaApp({
        page,

        // Render Inertia pages using ReactDOMServer (SSR)
        render: ReactDOMServer.renderToString,

        // Dynamically set document title using app name from shared props
        title: (title) => {
            // Safely read Laravel's app name from shared props
            const appName = page?.props?.name ?? 'dev_ng';
            return `${title} - ${appName}`;
        },

        // Dynamically resolve all pages from the pages/ directory
        resolve: (name) =>
            resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),

        // Setup the SSR environment
        setup: ({ App, props }) => {
            /* eslint-disable */

            // Define Ziggy's global `route()` helper for SSR context
            // Types are ignored due to known Ziggy+SSR limitations
            // @ts-expect-error
            global.route<RouteName> = (name, params, absolute) =>
                route(name, params as any, absolute, {
                    // @ts-expect-error
                    ...page.props.ziggy,
                    // @ts-expect-error
                    location: new URL(page.props.ziggy.location),
                });

            /* eslint-enable */

            return <App {...props} />;
        },
    }),
);
