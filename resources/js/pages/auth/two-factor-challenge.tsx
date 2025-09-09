import { Head, Link, useForm } from '@inertiajs/react';
import { LoaderCircle, Shield, Key } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/elements/text-link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth/auth-layout';

export default function TwoFactorChallenge() {
    const [useRecoveryCode, setUseRecoveryCode] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        code: '',
        recovery_code: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('two-factor.verify'));
    };

    return (
        <AuthLayout 
            title="Two-Factor Authentication" 
            description={useRecoveryCode 
                ? 'Please enter one of your recovery codes'
                : 'Please enter the authentication code from your authenticator app'
            }
        >
            <Head title="Two-Factor Authentication" />

            <form
                onSubmit={submit}
                className="flex flex-col gap-6 opacity-0 animate-fade-in"
            >
                <div className="grid gap-6">
                    {useRecoveryCode ? (
                        <div className="grid gap-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Key className="h-4 w-4 text-purple-600" />
                                <Label htmlFor="recovery_code" className="text-zinc-900 dark:text-white font-medium">
                                    Recovery Code
                                </Label>
                            </div>
                            <Input
                                id="recovery_code"
                                type="text"
                                value={data.recovery_code}
                                onChange={(e) => setData('recovery_code', e.target.value)}
                                placeholder="ABCD1234"
                                autoFocus
                                autoComplete="off"
                                className="bg-white/10 border-white/30 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-white/60 focus:ring-2 focus:ring-purple-500 transition duration-300"
                            />
                            <InputError message={errors.recovery_code} />
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield className="h-4 w-4 text-purple-600" />
                                <Label htmlFor="code" className="text-zinc-900 dark:text-white font-medium">
                                    Authentication Code
                                </Label>
                            </div>
                            <Input
                                id="code"
                                type="text"
                                value={data.code}
                                onChange={(e) => setData('code', e.target.value)}
                                placeholder="123456"
                                maxLength={6}
                                autoFocus
                                autoComplete="off"
                                className="text-center text-lg font-mono tracking-widest bg-white/10 border-white/30 text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-white/60 focus:ring-2 focus:ring-purple-500 transition duration-300"
                            />
                            <InputError message={errors.code} />
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg py-2 rounded-md transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50"
                        disabled={processing || (!data.code && !data.recovery_code)}
                    >
                        {processing ? (
                            <div className="flex items-center justify-center gap-2">
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                Verifying...
                            </div>
                        ) : (
                            'Verify'
                        )}
                    </button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setUseRecoveryCode(!useRecoveryCode);
                                setData('code', '');
                                setData('recovery_code', '');
                            }}
                            className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition duration-200"
                        >
                            {useRecoveryCode 
                                ? 'Use authentication code instead'
                                : 'Use a recovery code instead'
                            }
                        </button>
                    </div>
                </div>

                <div className="text-center text-sm text-zinc-700 dark:text-white/70">
                    <Link
                        href={route('logout')}
                        method="post"
                        className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition duration-200"
                    >
                        Sign out
                    </Link>
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