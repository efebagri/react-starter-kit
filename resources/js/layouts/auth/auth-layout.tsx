import React, { PropsWithChildren } from 'react';
import { Link } from '@inertiajs/react';
import AppLogo from '@/components/elements/app-logo';

type AuthLayoutProps = PropsWithChildren<{
    title: string;
    description: string;
}> & React.HTMLAttributes<HTMLDivElement>;

export default function AuthLayout({ children, title, description, ...rest }: AuthLayoutProps) {
    return (
        <div
            {...rest}
            className="flex min-h-svh flex-col items-center justify-center gap-6 bg-cover bg-center bg-no-repeat p-6 md:p-10"
            style={{
                backgroundImage: "url('/assets/img/backgrounds/galaxy.gif')",
                ...(rest.style || {}),
            }}
        >
            <div className="w-full max-w-sm bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md rounded-xl p-6 shadow-xl">
                <div className="flex flex-col gap-8">
                    <div className="flex flex-col items-center gap-4">
                        <Link href={route('home')} className="flex flex-col items-center gap-2 font-medium">
                            <div className="mb-1 flex h-9 w-40 items-center justify-center rounded-md">
                                <AppLogo />
                            </div>
                            <span className="sr-only">{title}</span>
                        </Link>

                        <div className="space-y-2 text-center">
                            <h1 className="text-xl font-medium text-zinc-900 dark:text-white">{title}</h1>
                            <p className="text-center text-sm text-muted-foreground">{description}</p>
                        </div>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
