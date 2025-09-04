import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/elements/text-link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth/auth-layout';

type RegisterForm = {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
};

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<Required<RegisterForm>>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Create an account" description="Enter your details below to create your account">
            <Head title="Register" />

            <form className="flex flex-col gap-6 opacity-0 animate-fade-in" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="username" className="text-white">Username</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Username"
                            className="bg-white/10 border-white/30 text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 transition duration-300"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email" className="text-white">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="your@email.com"
                            className="bg-white/10 border-white/30 text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 transition duration-300"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password" className="text-white">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
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
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Confirm password"
                            className="bg-white/10 border-white/30 text-white placeholder-white/60 focus:ring-2 focus:ring-purple-500 transition duration-300"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <button
                        type="submit"
                        tabIndex={5}
                        disabled={processing}
                        className="mt-2 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-lg py-2 rounded-md transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                        {processing ? (
                            <div className="flex items-center justify-center gap-2">
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                                Creating...
                            </div>
                        ) : (
                            'Create account'
                        )}
                    </button>
                </div>

                <div className="text-center text-sm text-white/70">
                    Already have an account?{' '}
                    <TextLink href={route('login')} tabIndex={6} className="text-purple-300 hover:text-purple-400">
                        Log in
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
