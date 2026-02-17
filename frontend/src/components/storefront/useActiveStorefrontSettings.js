import { useMemo } from 'react';
import { normalizeSettingsLayout } from '@/utils/layoutSchema';

export default function useActiveStorefrontSettings({ loading, clientSettings, initialSettings }) {
    return useMemo(() => {
        const baseSettings = loading ? initialSettings : clientSettings;
        return normalizeSettingsLayout(baseSettings);
    }, [loading, clientSettings, initialSettings]);
}
