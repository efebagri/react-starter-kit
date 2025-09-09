import { usePage, router } from '@inertiajs/react';
import { useEffect } from 'react';

interface SharedPageProps {
    permissions: string[];
}

interface RequirePermissionProps {
    permission: string;
    children: React.ReactNode;
    redirectTo?: string;
}

/**
 * Only renders children if the user has the given permission.
 * Optionally redirects if not authorized.
 */
export default function RequirePermission({
      permission,
      children,
      redirectTo = '/',
    }: RequirePermissionProps) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const { props } = usePage<SharedPageProps>();
    const permissions = props.permissions ?? [];

    const hasPermission = permissions.includes(permission);

    useEffect(() => {
        if (!hasPermission && redirectTo) {
            router.visit(redirectTo);
        }
    }, [hasPermission, redirectTo]);

    if (!hasPermission) {
        return null;
    }

    return <>{children}</>;
}
