<!--
    ~ User: Exbil by Efe Bagri
    ~ Date/Time: <?= date('d/m/y, g:i A') ?>

    ~ File: index.html
    ~
    ~ Modified: 03/07/25, 9:15 PM
    ~
    ~ Copyright (c) 2003 - <?= date('Y') ?> Exbil (https://www.exbil.net)
    ~    All rights Reserved.
  -->

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <!-- title -->
        <title inertia>{{ config('app.name', 'dev_ng') }}</title>
        
        <!-- CSRF Token -->
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <!-- Core Meta / SEO -->
        <meta name="theme-color" content="#242424" data-react-helmet="true" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta name="description" content="" />
        <meta name="robots" content="index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1" />
        <meta name="keywords" content="">
        <meta name="author" content="Efe Bagri" />
        <meta name="website" content="{{ config('app.url') }}" />
        <meta name="Version" content="v{{ config('app.version') }}" />

        <!-- Open Graph / Facebook Meta Tags -->
        <meta property="og:locale" content="{{ config('app.faker_locale') }}" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="{{ config('app.name') }}" />
        <meta property="og:description" content="" />
        <meta property="og:url" content="{{ config('app.url') }}" />
        <meta property="og:site_name" content="{{ config('app.name', 'Laravel') }}" />
        <meta property="og:image" content="{{ config('app.url') }}/assets/img/logos/logo_banner.png" />
        <meta property="og:image:secure_url" content="{{ config('app.url') }}/assets/img/logos/logo_banner.png">
        <meta property="og:image:width" content="560">
        <meta property="og:image:height" content="315">

        <!-- twitter cards -->
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:description" content="">
        <meta name="twitter:title" content="{{ config('app.name', 'dev_ng') }}">
        <meta name="twitter:site" content="{{ '@' . config('app.name', 'dev_ng') }}">
        <meta name="twitter:image" content="{{ config('app.url') }}/assets/img/logos/logo_banner.png">
        <meta name="twitter:creator" content="{{ '@' . config('app.name', 'dev_ng') }}">

        <!-- favicon -->
        <link rel="apple-touch-icon" sizes="180x180" href="{{ config('app.url') }}/apple-touch-icon.png">
        <link rel="icon" type="image/ico" href="{{ config('app.url') }}/favicon.ico">
        <link rel="icon" type="image/png" sizes="32x32" href="{{ config('app.url') }}/favicon.png">
        <link rel="icon" type="image/png" sizes="16x16" href="{{ config('app.url') }}/favicon.png">
        <link rel="mask-icon" href="{{ config('app.url') }}/favicon.svg" color="#fdc40b">
        <link rel="shortcut icon" href="{{ config('app.url') }}/favicon.ico">

        <!-- Webfonts (early connection + CSS) -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        <!-- Inertia root: the current page component renders here -->
        @inertia
    </body>
</html>
