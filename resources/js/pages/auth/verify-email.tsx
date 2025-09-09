// Components
import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import TextLink from '@/components/elements/text-link';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/auth/auth-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('verification.send'));
    };

    return (
        <AuthLayout
            title="Verify your email address"
            description="Click the link we just sent to your email address to verify your account."
        >
            <Head title="Verify Email" />

            <form
                onSubmit={submit}
                className="flex flex-col gap-6 opacity-0 animate-fade-in"
            >
                {status === 'verification-link-sent' && (
                    <div className="text-center text-sm font-medium text-green-400 animate-pulse">
                        A new verification link has been sent to your email.
                    </div>
                )}

                <div className="grid gap-4">
                    <Button
                        type="submit"
                        disabled={processing}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg py-2 rounded-md transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                        {processing ? (
                            <div className="flex items-center justify-center gap-2">
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                Sending...
                            </div>
                        ) : (
                            'Resend verification email'
                        )}
                    </Button>

                    <TextLink
                        href={route('logout')}
                        method="post"
                        className="block text-center text-sm text-purple-300 hover:text-purple-400"
                    >
                        Log out
                    </TextLink>
                </div>
            </form>

            <style>
                {`
                    @keyframes fade-in {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }

                    .animate-fade-in {
                        animation: fade-in 0.8s ease-out forwards;
                    }
                `}
            </style>
        </AuthLayout>
    );
}
