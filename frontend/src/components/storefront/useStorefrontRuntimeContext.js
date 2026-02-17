import { useMemo } from 'react';

export default function useStorefrontRuntimeContext() {
    return useMemo(() => {
        const hasWindow = typeof window !== 'undefined';
        const width = hasWindow ? window.innerWidth : 1280;
        const device = width <= 768 ? 'mobile' : width <= 1024 ? 'tablet' : 'desktop';
        const query = hasWindow ? new URLSearchParams(window.location.search) : new URLSearchParams('');
        const pathname = hasWindow ? window.location.pathname : '/';
        const isEmbeddedPreview = hasWindow && query.get('visualEditor') === '1';
        const isStorefrontBuilder = hasWindow && query.get('storefrontBuilder') === '1';
        const seed = hasWindow
            ? window.localStorage.getItem('vb-seed') || `${Date.now()}`
            : 'server';

        if (hasWindow && !window.localStorage.getItem('vb-seed')) {
            window.localStorage.setItem('vb-seed', seed);
        }

        return {
            device,
            query,
            pathname,
            seed,
            isEmbeddedPreview,
            isStorefrontBuilder,
            isLoggedIn: false,
        };
    }, []);
}
