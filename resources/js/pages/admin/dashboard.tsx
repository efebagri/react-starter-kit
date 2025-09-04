import AppLayout from '@/layouts/app/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import RequirePermission from '@/components/RequirePermission';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Admin Dashboard',
        href: '/admin/dashboard',
    },
];

export default function Dashboard() {
    return (
        <RequirePermission permission="view_admin_panel">
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Admin Dashboard" />
            </AppLayout>
        </RequirePermission>
    );
}
