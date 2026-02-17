import { useMemo } from 'react';

export default function useStorefrontPermissions({ isAuthenticated, role }) {
    const canEditStorefront = useMemo(() => {
        if (!isAuthenticated) return false;
        return ['admin', 'designer', 'publisher'].includes(role);
    }, [isAuthenticated, role]);

    const canPublishStorefront = useMemo(() => {
        if (!isAuthenticated) return false;
        return ['admin', 'publisher'].includes(role);
    }, [isAuthenticated, role]);

    return {
        canEditStorefront,
        canPublishStorefront,
    };
}
