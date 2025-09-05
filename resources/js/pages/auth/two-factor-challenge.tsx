import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useForm } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { Shield, Key } from 'lucide-react';

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <Shield className="mx-auto h-12 w-12 text-indigo-600" />
                    <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                        Two-Factor Authentication
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {useRecoveryCode 
                            ? 'Please enter one of your recovery codes'
                            : 'Please enter the authentication code from your authenticator app'
                        }
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            {useRecoveryCode ? <Key className="h-5 w-5" /> : <Shield className="h-5 w-5" />}
                            {useRecoveryCode ? 'Recovery Code' : 'Authentication Code'}
                        </CardTitle>
                        <CardDescription>
                            {useRecoveryCode 
                                ? 'Enter one of your recovery codes to access your account'
                                : 'Enter the 6-digit code from your authenticator app'
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-6">
                            {useRecoveryCode ? (
                                <div>
                                    <Label htmlFor="recovery_code">Recovery Code</Label>
                                    <Input
                                        id="recovery_code"
                                        type="text"
                                        value={data.recovery_code}
                                        onChange={(e) => setData('recovery_code', e.target.value)}
                                        placeholder="ABCD1234"
                                        className="mt-1"
                                        autoFocus
                                        autoComplete="off"
                                        error={errors.recovery_code}
                                    />
                                    {errors.recovery_code && (
                                        <p className="mt-2 text-sm text-red-600">{errors.recovery_code}</p>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <Label htmlFor="code">Authentication Code</Label>
                                    <Input
                                        id="code"
                                        type="text"
                                        value={data.code}
                                        onChange={(e) => setData('code', e.target.value)}
                                        placeholder="123456"
                                        maxLength={6}
                                        className="mt-1 text-center text-lg font-mono tracking-widest"
                                        autoFocus
                                        autoComplete="off"
                                        error={errors.code}
                                    />
                                    {errors.code && (
                                        <p className="mt-2 text-sm text-red-600">{errors.code}</p>
                                    )}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={processing || (!data.code && !data.recovery_code)}
                            >
                                {processing ? 'Verifying...' : 'Verify'}
                            </Button>

                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUseRecoveryCode(!useRecoveryCode);
                                        setData('code', '');
                                        setData('recovery_code', '');
                                    }}
                                    className="text-sm text-indigo-600 hover:text-indigo-500"
                                >
                                    {useRecoveryCode 
                                        ? 'Use authentication code instead'
                                        : 'Use a recovery code instead'
                                    }
                                </button>
                            </div>

                            <div className="text-center">
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    className="text-sm text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
                                >
                                    Sign out
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}