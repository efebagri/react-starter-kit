import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth/auth-layout';

interface ResetPasswordProps {
    token: string;
    email: string;
}

type ResetPasswordForm = {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<ResetPasswordForm>>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Reset password" description="Please enter your new password below">
            <Head title="Reset password" />

            <form onSubmit={submit} className="grid gap-6 opacity-0 animate-fade-in">
                <div className="grid gap-2">
                    <Label htmlFor="email" className="text-white">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={data.email}
                        readOnly
                        className="bg-white/10 border-white/30 text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 transition duration-300"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password" className="text-white">Password</Label>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        value={data.password}
                        autoFocus
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Password"
                        className="bg-white/10 border-white/30 text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 transition duration-300"
                    />
                    <InputError message={errors.password} />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="password_confirmation" className="text-white">Confirm password</Label>
                    <Input
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        autoComplete="new-password"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        placeholder="Confirm password"
                        className="bg-white/10 border-white/30 text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 transition duration-300"
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <button
                    type="submit"
                    className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg py-2 rounded-md transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50"
                    disabled={processing}
                >
                    {processing ? (
                        <div className="flex items-center justify-center gap-2">
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Resetting...
                        </div>
                    ) : (
                        'Reset password'
                    )}
                </button>
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
