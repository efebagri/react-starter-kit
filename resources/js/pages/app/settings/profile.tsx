import React from 'react';
import AppLayout from '@/layouts/app/app-layout';
import { Transition } from '@headlessui/react';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import SettingsLayout from '@/layouts/app/settings/layout';
import { UserAvatar } from '@/components/ui/UserAvatar';
import DeleteUser from '@/components/elements/delete-user';
import AppearanceTabs from '@/components/elements/appearance-tabs';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/app/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    email: string;
};

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<ProfileForm>({
        name: auth.user?.name ?? '',
        email: auth.user?.email ?? ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="p-6 max-w-4xl mx-auto space-y-6 text-zinc-900 dark:text-white">
                    <h1 className="text-3xl font-bold">Profile Settings</h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 shadow border border-zinc-200 dark:border-zinc-700 space-y-6">
                            {/* Avatar and name */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <UserAvatar string={`${auth.user.name}`} className={'w-12 h-12'} />

                                    <div className="space-y-0.5">
                                        <h2 className="text-xl font-semibold leading-tight">
                                            {auth.user.name}
                                        </h2>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400">{auth.user.email}</p>
                                    </div>
                                </div>

                                <div className="self-start sm:self-auto">
                                    <AppearanceTabs />
                                </div>
                            </div>

                            {/* Editable fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Username</label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-500"
                                    />
                                    {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm focus:outline-none focus:ring focus:ring-indigo-500"
                                    />
                                    {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                                </div>
                            </div>

                            {/* Email verification info */}
                            {mustVerifyEmail && auth.user.email_verified_at === null && (
                                <div className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-indigo-600 dark:text-indigo-400 underline hover:opacity-90"
                                    >
                                        Click here to resend the verification email.
                                    </Link>

                                    {status === 'verification-link-sent' && (
                                        <p className="mt-2 text-sm font-medium text-green-600 dark:text-green-400">
                                            A new verification link has been sent to your email address.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="pt-2 flex items-center gap-4">
                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                            >
                                Save
                            </button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600 dark:text-neutral-300">Saved</p>
                            </Transition>
                        </div>
                    </form>

                    <DeleteUser />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
