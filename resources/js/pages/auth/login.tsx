import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle, Key } from 'lucide-react';
import { FormEventHandler, useState, useEffect } from 'react';

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

    const [webauthnSupported, setWebauthnSupported] = useState(false);
    const [webauthnLoading, setWebauthnLoading] = useState(false);

    // Check WebAuthn support on component mount
    useEffect(() => {
        const checkWebAuthnSupport = () => {
            const isSupported = !!(
                window.PublicKeyCredential &&
                navigator.credentials &&
                navigator.credentials.get &&
                (window.location.protocol === 'https:' || window.location.hostname === 'localhost')
            );
            setWebauthnSupported(isSupported);
        };
        
        checkWebAuthnSupport();
    }, []);

    const handleWebAuthnLogin = async () => {
        if (!webauthnSupported) return;
        
        setWebauthnLoading(true);
        try {
            // Get authentication options using simple fetch without CSRF
            const optionsResponse = await fetch('/webauthn/login/options', {
                method: 'GET', // Change to GET to avoid CSRF issues
                headers: {
                    'Accept': 'application/json',
                },
                credentials: 'same-origin',
            });
            
            if (!optionsResponse.ok) {
                throw new Error('Failed to get authentication options');
            }
            
            const options = await optionsResponse.json();
            
            // Convert challenge from base64 to ArrayBuffer
            const challenge = Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0));
            
            // Create assertion
            const credential = await navigator.credentials.get({
                publicKey: {
                    challenge: challenge,
                    rpId: options.rpId,
                    allowCredentials: options.allowCredentials?.map((cred: any) => ({
                        id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0)),
                        type: cred.type,
                        transports: cred.transports,
                    })) || [],
                    userVerification: options.userVerification,
                    timeout: options.timeout,
                }
            }) as PublicKeyCredential;

            if (!credential) {
                throw new Error('Authentication canceled');
            }

            // Convert credential to JSON format
            const credentialJson = {
                id: credential.id,
                rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
                type: credential.type,
                response: {
                    authenticatorData: btoa(String.fromCharCode(...new Uint8Array((credential.response as AuthenticatorAssertionResponse).authenticatorData))),
                    clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(credential.response.clientDataJSON))),
                    signature: btoa(String.fromCharCode(...new Uint8Array((credential.response as AuthenticatorAssertionResponse).signature))),
                    userHandle: (credential.response as AuthenticatorAssertionResponse).userHandle ? btoa(String.fromCharCode(...new Uint8Array((credential.response as AuthenticatorAssertionResponse).userHandle!))) : null,
                },
            };

            // Send authentication request
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
            const authResponse = await fetch('/webauthn/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken,
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    credential: credentialJson,
                }),
            });

            if (authResponse.ok) {
                // Redirect to dashboard on successful authentication
                window.location.href = '/app';
            } else {
                const errorData = await authResponse.json();
                throw new Error(errorData.error || 'Authentication failed');
            }
        } catch (error) {
            console.error('WebAuthn login error:', error);
            alert(`Login failed: ${error}`);
        } finally {
            setWebauthnLoading(false);
        }
    };

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

                    {webauthnSupported && (
                        <>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-white/20" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-purple-900/50 px-2 text-white/60">Or</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleWebAuthnLogin}
                                disabled={webauthnLoading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg py-2 rounded-md transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {webauthnLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <LoaderCircle className="h-4 w-4 animate-spin" />
                                        Authenticating...
                                    </div>
                                ) : (
                                    <>
                                        <Key className="h-4 w-4" />
                                        Sign in with Passkey
                                    </>
                                )}
                            </button>
                        </>
                    )}
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
