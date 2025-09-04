import AppLayout from '@/layouts/app/app-layout';
import SettingsLayout from '@/layouts/app/settings/layout';
import { type BreadcrumbItem } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Password settings',
        href: '/app/settings/password',
    },
];

export default function Password() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Password settings" />

            <SettingsLayout>
                <h1 className="text-3xl font-bold">Password Settings</h1>

                <form onSubmit={updatePassword} className="space-y-2">
                    <div className="bg-white dark:bg-zinc-900 space-y-5">

                        <div className="space-y-2">
                            <Label htmlFor="current_password" className="text-sm font-medium">
                                Current password
                            </Label>
                            <Input
                                id="current_password"
                                ref={currentPasswordInput}
                                value={data.current_password}
                                onChange={(e) => setData('current_password', e.target.value)}
                                type="password"
                                autoComplete="current-password"
                                placeholder="Enter current password"
                                className="w-full"
                            />
                            <InputError message={errors.current_password} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium">
                                New password
                            </Label>
                            <Input
                                id="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                type="password"
                                autoComplete="new-password"
                                placeholder="Enter new password"
                                className="w-full"
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password_confirmation" className="text-sm font-medium">
                                Confirm new password
                            </Label>
                            <Input
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                type="password"
                                autoComplete="new-password"
                                placeholder="Confirm new password"
                                className="w-full"
                            />
                            <InputError message={errors.password_confirmation} />
                        </div>

                        <div className="pt-2 flex items-center gap-4">
                            <Button type="submit" disabled={processing}>
                                Save Password
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-green-600 dark:text-green-400">Password updated.</p>
                            </Transition>
                        </div>
                    </div>
                </form>
            </SettingsLayout>
        </AppLayout>
    );
}
