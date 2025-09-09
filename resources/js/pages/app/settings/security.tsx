import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import SettingsLayout from '@/layouts/app/settings/layout';
import { Head, router } from '@inertiajs/react';
import { Key, RefreshCw, Shield, Smartphone, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app/app-layout';
import { formatDateTime } from '@/extensions/utils';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Security settings',
        href: '/app/settings/security',
    },
];

interface WebAuthnCredential {
    id: number;
    name: string;
    credential_id: string;
    created_at: string;
    last_used_at: string | null;
}

interface SecurityPageProps {
    twoFactorEnabled: boolean;
    webAuthnCredentials: WebAuthnCredential[];
    recoveryCodes: string[];
    flash?: {
        success?: string;
        error?: string;
    };
}

export default function SecurityPage({ twoFactorEnabled, webAuthnCredentials, recoveryCodes, flash }: SecurityPageProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showQrCode, setShowQrCode] = useState(false);
    const [qrCodeData, setQrCodeData] = useState<{ qr_code: string; recovery_codes: string[] } | null>(null);
    const [verificationCode, setVerificationCode] = useState('');
    const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
    const [password, setPassword] = useState('');
    const [passkeyName, setPasskeyName] = useState('');
    const [showPasskeyDialog, setShowPasskeyDialog] = useState(false);
    const [webauthnSupported, setWebauthnSupported] = useState(false);
    const [showRemoveDialog, setShowRemoveDialog] = useState(false);
    const [credentialToRemove, setCredentialToRemove] = useState<WebAuthnCredential | null>(null);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Check WebAuthn support on the component mount
    useEffect(() => {
        const checkWebAuthnSupport = () => {
            const isSupported = !!(
                window.PublicKeyCredential &&
                navigator.credentials &&
                typeof navigator.credentials.create === 'function' &&
                (window.location.protocol === 'https:' || window.location.hostname === 'localhost')
            );
            setWebauthnSupported(isSupported);

            if (!isSupported) {
                console.warn('WebAuthn not supported. Requirements: HTTPS + modern browser');
            }
        };

        checkWebAuthnSupport();
    }, []);

    const handleEnable2FA = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/app/settings/security/two-factor/enable', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            const data = await response.json();

            if (response.ok) {
                setQrCodeData(data);
                setShowQrCode(true);
            }
        } catch (error) {
            console.error('Error enabling 2FA:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm2FA = async () => {
        if (!verificationCode) return;

        setIsLoading(true);
        try {
            const response = await fetch('/app/settings/security/two-factor/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({ code: verificationCode }),
            });

            if (response.ok) {
                router.reload();
                setShowQrCode(false);
                setVerificationCode('');
            }
        } catch (error) {
            console.error('Error confirming 2FA:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDisable2FA = async () => {
        if (!password) return;

        setIsLoading(true);
        try {
            // Use Inertia router for proper CSRF handling
            router.delete('/app/settings/security/two-factor/disable', {
                data: { password },
                onSuccess: () => {
                    setPassword('');
                },
                onError: (errors) => {
                    console.error('Error disabling 2FA:', errors);
                },
                onFinish: () => {
                    setIsLoading(false);
                }
            });
        } catch (error) {
            console.error('Error disabling 2FA:', error);
            setIsLoading(false);
        }
    };

    const handleRegenerateRecoveryCodes = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/app/settings/security/two-factor/recovery-codes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                router.reload();
            }
        } catch (error) {
            console.error('Error regenerating recovery codes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegisterPasskey = async () => {
        if (!passkeyName.trim()) return;

        setIsLoading(true);
        try {
            // Get registration options
            const optionsResponse = await fetch('/app/settings/security/webauthn/register/options', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });
            const options = await optionsResponse.json();

            if (!optionsResponse.ok) throw new Error(options.error);

            // Check if WebAuthn is supported
            if (!webauthnSupported) {
                const debugInfo = {
                    PublicKeyCredential: !!window.PublicKeyCredential,
                    credentials: !!navigator.credentials,
                    create: !!navigator.credentials?.create,
                    protocol: window.location.protocol,
                    hostname: window.location.hostname
                };
                console.error('WebAuthn Debug Info:', debugInfo);
                throw new Error(`WebAuthn nicht unterstützt. Debug: ${JSON.stringify(debugInfo)}`);
            }

            // Convert challenge from base64 to ArrayBuffer
            const challenge = Uint8Array.from(atob(options.challenge), c => c.charCodeAt(0));
            const userId = Uint8Array.from(atob(options.user.id), c => c.charCodeAt(0));

            // Create WebAuthn credential
            const credential = await navigator.credentials.create({
                publicKey: {
                    challenge: challenge,
                    rp: {
                        name: options.rp.name,
                        id: options.rp.id,
                    },
                    user: {
                        id: userId,
                        name: options.user.name,
                        displayName: options.user.displayName,
                    },
                    pubKeyCredParams: options.pubKeyCredParams,
                    timeout: options.timeout,
                    excludeCredentials: options.excludeCredentials?.map((cred: { id: string; type: string; transports: string[] }) => ({
                        id: Uint8Array.from(atob(cred.id), c => c.charCodeAt(0)),
                        type: cred.type,
                        transports: cred.transports,
                    })) || [],
                    authenticatorSelection: options.authenticatorSelection,
                    attestation: options.attestation,
                }
            }) as PublicKeyCredential;

            if (!credential) {
                throw new Error('Failed to create credential');
            }

            // Convert credential to JSON format
            const registrationResponse = {
                id: credential.id,
                rawId: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
                type: credential.type,
                response: {
                    attestationObject: btoa(String.fromCharCode(...new Uint8Array((credential.response as AuthenticatorAttestationResponse).attestationObject))),
                    clientDataJSON: btoa(String.fromCharCode(...new Uint8Array(credential.response.clientDataJSON))),
                },
            };

            // Register the credential
            const registerResponse = await fetch('/app/settings/security/webauthn/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    name: passkeyName,
                    credential: registrationResponse,
                }),
            });

            if (registerResponse.ok) {
                router.reload();
                setShowPasskeyDialog(false);
                setPasskeyName('');
            } else {
                const errorData = await registerResponse.json();
                throw new Error(errorData.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Error registering passkey:', error);
            setErrorMessage(`Error: ${error}`);
            setShowErrorDialog(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemovePasskey = async () => {
        if (!credentialToRemove || !password) return;

        setIsLoading(true);
        try {
            // Use Inertia router for proper CSRF handling
            router.delete('/app/settings/security/webauthn/credential', {
                data: {
                    credential_id: credentialToRemove.credential_id,
                    password,
                },
                onSuccess: () => {
                    setShowRemoveDialog(false);
                    setCredentialToRemove(null);
                    setPassword('');
                },
                onError: (errors) => {
                    console.error('Error removing passkey:', errors);
                },
                onFinish: () => {
                    setIsLoading(false);
                }
            });
        } catch (error) {
            console.error('Error removing passkey:', error);
            setIsLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />
            <SettingsLayout>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Security</h1>
                        <p className="text-muted-foreground">
                            Manage your account security settings including two-factor authentication and passkeys.
                        </p>
                    </div>

                    <Separator />

                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                                <p className="text-sm text-green-800 dark:text-green-200">
                                    {flash.success}
                                </p>
                            </div>
                        </div>
                    )}

                    {flash?.error && (
                        <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 bg-red-400 rounded-full"></div>
                                <p className="text-sm text-red-800 dark:text-red-200">
                                    {flash.error}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Two-Factor Authentication */}
                    <Card>
                        <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                            <div className="flex items-center space-x-2">
                                <Smartphone className="h-5 w-5" />
                                <div>
                                    <CardTitle>Two-Factor Authentication</CardTitle>
                                    <CardDescription>Add an extra layer of security to your account using a mobile app.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {twoFactorEnabled ? (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <Shield className="h-4 w-4 text-green-600" />
                                            <span className="text-sm font-medium text-green-600">Enabled</span>
                                        </div>
                                    </div>

                                    {recoveryCodes.length > 0 && (
                                        <div className="space-y-2">
                                            <Button variant="outline" size="sm" onClick={() => setShowRecoveryCodes(!showRecoveryCodes)}>
                                                {showRecoveryCodes ? 'Hide' : 'Show'} Recovery Codes
                                            </Button>
                                            {showRecoveryCodes && (
                                                <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-4">
                                                    {recoveryCodes.map((code, index) => (
                                                        <code key={index} className="font-mono text-xs">
                                                            {code}
                                                        </code>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex space-x-2">
                                        <Button variant="outline" size="sm" onClick={handleRegenerateRecoveryCodes} disabled={isLoading}>
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Regenerate Recovery Codes
                                        </Button>
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="destructive" size="sm">
                                                    Disable 2FA
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
                                                    <DialogDescription>Enter your password to disable two-factor authentication.</DialogDescription>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                    <div>
                                                        <Label htmlFor="disable-password">Password</Label>
                                                        <Input
                                                            id="disable-password"
                                                            type="password"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                        />
                                                    </div>
                                                    <Button
                                                        onClick={handleDisable2FA}
                                                        disabled={isLoading || !password}
                                                        className="w-full"
                                                        variant="destructive"
                                                    >
                                                        Disable Two-Factor Authentication
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                        Two-factor authentication is not enabled. Enable it to secure your account.
                                    </p>
                                    <Button onClick={handleEnable2FA} disabled={isLoading}>
                                        Enable Two-Factor Authentication
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Passkeys */}
                    <Card>
                        <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                            <div className="flex items-center space-x-2">
                                <Key className="h-5 w-5" />
                                <div>
                                    <CardTitle>Passkeys</CardTitle>
                                    <CardDescription>Use passkeys for secure, passwordless authentication.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {!webauthnSupported && (
                                <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 bg-yellow-400 rounded-full"></div>
                                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                                            <strong>WebAuthn not available:</strong> Passkeys require HTTPS and a modern browser (Chrome, Firefox, Safari, Edge).
                                        </p>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <p className="text-sm">
                                    {webAuthnCredentials.length} passkey{webAuthnCredentials.length !== 1 ? 's' : ''} registered
                                </p>
                                <Dialog open={showPasskeyDialog} onOpenChange={setShowPasskeyDialog}>
                                    <DialogTrigger asChild>
                                        <Button size="sm" disabled={!webauthnSupported}>
                                            Add Passkey
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Passkey</DialogTitle>
                                            <DialogDescription>Give your passkey a name and follow the prompts to register it.</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="passkey-name">Passkey Name</Label>
                                                <Input
                                                    id="passkey-name"
                                                    placeholder="e.g., iPhone Touch ID"
                                                    value={passkeyName}
                                                    onChange={(e) => setPasskeyName(e.target.value)}
                                                />
                                            </div>
                                            <Button onClick={handleRegisterPasskey} disabled={isLoading || !passkeyName.trim()} className="w-full">
                                                Register Passkey
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>

                            {webAuthnCredentials.length > 0 && (
                                <div className="space-y-2">
                                    {webAuthnCredentials.map((credential) => (
                                        <div key={credential.id} className="flex items-center justify-between rounded-lg border p-3">
                                            <div>
                                                <p className="font-medium">{credential.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Created {formatDateTime(credential.created_at)}
                                                    {credential.last_used_at && (
                                                        <> • Last used {formatDateTime(credential.last_used_at)}</>
                                                    )}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setCredentialToRemove(credential);
                                                    setShowRemoveDialog(true);
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* QR Code Dialog */}
                <Dialog open={showQrCode} onOpenChange={setShowQrCode}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Set up Two-Factor Authentication</DialogTitle>
                            <DialogDescription>Scan the QR code with your authenticator app and enter the verification code.</DialogDescription>
                        </DialogHeader>
                        {qrCodeData && (
                            <div className="space-y-4">
                                <div className="flex justify-center">
                                    <div dangerouslySetInnerHTML={{ __html: qrCodeData.qr_code }} />
                                </div>
                                <div>
                                    <Label htmlFor="verification-code">Verification Code</Label>
                                    <Input
                                        id="verification-code"
                                        placeholder="000000"
                                        value={verificationCode}
                                        onChange={(e) => setVerificationCode(e.target.value)}
                                        maxLength={6}
                                    />
                                </div>
                                <Button onClick={handleConfirm2FA} disabled={isLoading || verificationCode.length !== 6} className="w-full">
                                    Verify and Enable
                                </Button>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                {/* Remove Passkey Dialog */}
                <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Remove Passkey</DialogTitle>
                            <DialogDescription>Enter your password to remove this passkey from your account.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="remove-password">Password</Label>
                                <Input id="remove-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            <Button onClick={handleRemovePasskey} disabled={isLoading || !password} className="w-full" variant="destructive">
                                Remove Passkey
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Error Dialog */}
                <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Error</DialogTitle>
                            <DialogDescription>
                                {errorMessage}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end mt-4">
                            <Button onClick={() => setShowErrorDialog(false)}>
                                OK
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </SettingsLayout>
        </AppLayout>
    );
}
