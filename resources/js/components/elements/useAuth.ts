import { usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';

export function useAuthUser() {
    const { auth } = usePage<SharedData>().props;
    return auth?.user ?? null;
}

export function useIsAuthenticated() {
    return !!useAuthUser();
}
