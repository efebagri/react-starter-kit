import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/elements/text-link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth/auth-layout';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm<Required<{ email: string }>>({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <AuthLayout title="Forgot password" description="Enter your email to receive a password reset link">
            <Head title="Forgot password" />

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-400 animate-pulse">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6 opacity-0 animate-fade-in">
                <div className="grid gap-2">
                    <Label htmlFor="email" className="text-white">Email address</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        autoComplete="off"
                        value={data.email}
                        autoFocus
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="your@email.com"
                        className="bg-white/10 border-white/30 text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 transition duration-300"
                    />
                    <InputError message={errors.email} />
                </div>

                <div className="flex items-center justify-start">
                    <button
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg py-2 rounded-md transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50"
                        disabled={processing}
                    >
                        {processing ? (
                            <div className="flex items-center justify-center gap-2">
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                Sending...
                            </div>
                        ) : (
                            'Email password reset link'
                        )}
                    </button>
                </div>

                <div className="text-center text-sm text-white/70 space-x-1">
                    <span>Or, return to</span>
                    <TextLink href={route('login')} className="text-purple-300 hover:text-purple-400">
                        log in
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
