import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/elements/text-link';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth/auth-layout';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
        email: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Log in to your account" description="Enter your email and password below to log in">
            <Head title="Log in" />

            <form
                onSubmit={submit}
                className="flex flex-col gap-6 opacity-0 animate-fade-in"
            >
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-white">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            onBlur={(e) => {
                                const value = e.target.value.trim();
                                if (value && !value.includes('@')) {
                                    setData('email', `${value}@gmail.com`);
                                }
                            }}
                            placeholder="your@email.com"
                            className="bg-white/10 border-white/30 text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 transition duration-300"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password" className="text-white">Password</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm text-purple-300 hover:text-purple-400" tabIndex={5}>
                                    Forgot password?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                            className="bg-white/10 border-white/30 text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 transition duration-300"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onClick={() => setData('remember', !data.remember)}
                            tabIndex={3}
                        />
                        <Label htmlFor="remember" className="text-white">Remember me</Label>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg py-2 rounded-md transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50"
                        tabIndex={4}
                        disabled={processing}
                    >
                        {processing ? (
                            <div className="flex items-center justify-center gap-2">
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                Logging in...
                            </div>
                        ) : (
                            'Log in'
                        )}
                    </button>
                </div>

                <div className="text-center text-sm text-white/70">
                    Don't have an account?{' '}
                    <TextLink href={route('register')} className="text-purple-300 hover:text-purple-400" tabIndex={5}>
                        Sign up
                    </TextLink>
                </div>

                {status && (
                    <div className="mt-4 text-center text-sm font-medium text-green-400 animate-pulse">
                        {status}
                    </div>
                )}
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
