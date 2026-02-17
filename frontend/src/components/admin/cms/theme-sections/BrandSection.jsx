import React from 'react';
import { useEffect, useState } from 'react';
import ImageUploader from '../ImageUploader';

const THEME_PREVIEW_MODE_KEY = 'theme-preview-mode-v1';
const THEME_PREVIEW_MODE_EVENT = 'theme-preview-mode-changed';

// Simple color picker component if not available globally
const ColorInput = ({ label, value, onChange }) => {
    return (
        <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">{label}</label>
            <div className="flex gap-2 items-center">
                <div className="relative group">
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-8 h-8 rounded border border-gray-200 cursor-pointer opacity-0 absolute inset-0 z-10"
                    />
                    <div
                        className="w-8 h-8 rounded border border-gray-200"
                        style={{ backgroundColor: value }}
                    />
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 text-xs px-2 py-1.5 border border-gray-200 rounded font-mono uppercase"
                    maxLength={7}
                />
            </div>
        </div>
    );
};

export default function BrandSection({ branding, theme, onBrandingChange, onThemeChange }) {
    const [previewMode, setPreviewMode] = useState('default');

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const raw = window.localStorage.getItem(THEME_PREVIEW_MODE_KEY) || 'default';
        const valid = new Set(['default', 'light', 'dark', 'system']);
        setPreviewMode(valid.has(raw) ? raw : 'default');
    }, []);

    const updateTheme = (updater) => {
        const nextTheme = typeof updater === 'function' ? updater(theme || {}) : updater;
        if (!nextTheme || typeof nextTheme !== 'object') return;
        Object.entries(nextTheme).forEach(([key, value]) => {
            onThemeChange(key, value);
        });
    };

    const handlePreviewModeChange = (mode) => {
        setPreviewMode(mode);
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(THEME_PREVIEW_MODE_KEY, mode);
            window.dispatchEvent(new CustomEvent(THEME_PREVIEW_MODE_EVENT, { detail: { mode } }));
        }
    };

    const updateColorModeField = (mode, key, value) => {
        const currentModes = theme?.colorModes || {};
        const nextModes = {
            ...currentModes,
            [mode]: {
                ...(currentModes?.[mode] || {}),
                [key]: value,
            },
        };

        updateTheme({ colorModes: nextModes });

        if (mode === 'light') {
            onThemeChange(key, value);
        }
    };

    const lightMode = theme?.colorModes?.light || {};
    const darkMode = theme?.colorModes?.dark || {};

    const handleBranding = (key, val) => {
        // Deep merge helper not strictly needed with simple structure
        if (key === 'logo' || key === 'favicon') {
            onBrandingChange({ ...branding, [key]: { ...(branding[key] || {}), url: val } });
        } else {
            onBrandingChange({ ...branding, [key]: val });
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    Assets
                </h4>
                <ImageUploader
                    label="Site Logo"
                    value={branding.logo?.url || ''}
                    onChange={(url) => handleBranding('logo', url)}
                />
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Width (px)</label>
                        <input
                            type="number"
                            value={branding.logo?.width || 120}
                            onChange={(e) => onBrandingChange({ ...branding, logo: { ...(branding.logo || {}), width: parseInt(e.target.value) } })}
                            className="w-full text-xs border-gray-200 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Height (px)</label>
                        <input
                            type="number"
                            value={branding.logo?.height || 40}
                            onChange={(e) => onBrandingChange({ ...branding, logo: { ...(branding.logo || {}), height: parseInt(e.target.value) } })}
                            className="w-full text-xs border-gray-200 rounded"
                        />
                    </div>
                </div>

                <ImageUploader
                    label="Favicon"
                    value={branding.favicon?.url || ''}
                    onChange={(url) => handleBranding('favicon', url)}
                />
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    Colors
                </h4>
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Theme Mode</label>
                    <select
                        value={theme.mode || 'light'}
                        onChange={(e) => onThemeChange('mode', e.target.value)}
                        className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded"
                    >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System</option>
                    </select>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-500">Preview Mode (Local Admin)</label>
                    <select
                        value={previewMode}
                        onChange={(e) => handlePreviewModeChange(e.target.value)}
                        className="w-full text-xs px-2 py-1.5 border border-gray-200 rounded"
                    >
                        <option value="default">Follow Theme Mode</option>
                        <option value="light">Force Light</option>
                        <option value="dark">Force Dark</option>
                        <option value="system">Follow System</option>
                    </select>
                </div>

                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Light Palette</p>
                <div className="grid grid-cols-2 gap-3">
                    <ColorInput
                        label="Primary"
                        value={lightMode.primaryColor || theme.primaryColor || '#000000'}
                        onChange={(v) => updateColorModeField('light', 'primaryColor', v)}
                    />
                    <ColorInput
                        label="Secondary"
                        value={lightMode.secondaryColor || theme.secondaryColor || '#ffffff'}
                        onChange={(v) => updateColorModeField('light', 'secondaryColor', v)}
                    />
                    <ColorInput
                        label="Background"
                        value={lightMode.backgroundColor || theme.backgroundColor || '#ffffff'}
                        onChange={(v) => updateColorModeField('light', 'backgroundColor', v)}
                    />
                    <ColorInput
                        label="Text"
                        value={lightMode.textColor || theme.textColor || '#111827'}
                        onChange={(v) => updateColorModeField('light', 'textColor', v)}
                    />
                </div>

                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide pt-2">Dark Palette</p>
                <div className="grid grid-cols-2 gap-3">
                    <ColorInput
                        label="Primary"
                        value={darkMode.primaryColor || '#C9B18F'}
                        onChange={(v) => updateColorModeField('dark', 'primaryColor', v)}
                    />
                    <ColorInput
                        label="Secondary"
                        value={darkMode.secondaryColor || '#6F5A43'}
                        onChange={(v) => updateColorModeField('dark', 'secondaryColor', v)}
                    />
                    <ColorInput
                        label="Background"
                        value={darkMode.backgroundColor || '#111827'}
                        onChange={(v) => updateColorModeField('dark', 'backgroundColor', v)}
                    />
                    <ColorInput
                        label="Text"
                        value={darkMode.textColor || '#F9FAFB'}
                        onChange={(v) => updateColorModeField('dark', 'textColor', v)}
                    />
                </div>
            </div>
        </div>
    );
}
