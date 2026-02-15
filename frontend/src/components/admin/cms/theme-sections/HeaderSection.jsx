
import React from 'react';

const NAV_LINK_STYLES = [
    { value: 'none', label: 'None' },
    { value: 'underline', label: 'Underline' },
    { value: 'pill', label: 'Pill' },
    { value: 'dot', label: 'Dot' },
];

export default function HeaderSection({ theme, announcementBar = {}, onAnnouncementChange, onThemeChange }) {

    const header = theme.header || {};

    const handleHeaderChange = (key, value) => {
        onThemeChange('header', { ...header, [key]: value });
    };

    // Use the passed handler for announcement bar to update the root setting
    const handleAnnouncementUpdate = (key, value) => {
        if (onAnnouncementChange) {
            onAnnouncementChange({ ...announcementBar, [key]: value });
        }
    };

    return (
        <div className="space-y-6">

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-500">Enable Announcement Bar</label>
                    <input
                        type="checkbox"
                        checked={announcementBar.enabled !== false}
                        onChange={(e) => handleAnnouncementUpdate('enabled', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                </div>

                {announcementBar.enabled !== false && (
                    <div className="mt-2 space-y-3 pl-2 border-l-2 border-gray-100">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Text</label>
                            <input
                                type="text"
                                value={announcementBar.text || ''}
                                onChange={(e) => handleAnnouncementUpdate('text', e.target.value)}
                                className="w-full text-sm border-gray-200 rounded"
                                placeholder="Free shipping today!"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Bg Color</label>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="color"
                                        value={announcementBar.backgroundColor || '#10b981'}
                                        onChange={(e) => handleAnnouncementUpdate('backgroundColor', e.target.value)}
                                        className="w-6 h-6 border-none p-0 bg-transparent cursor-pointer"
                                    />
                                    <span className="text-xs text-gray-400">{announcementBar.backgroundColor}</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Text Color</label>
                                <div className="flex items-center gap-1">
                                    <input
                                        type="color"
                                        value={announcementBar.textColor || '#ffffff'}
                                        onChange={(e) => handleAnnouncementUpdate('textColor', e.target.value)}
                                        className="w-6 h-6 border-none p-0 bg-transparent cursor-pointer"
                                    />
                                    <span className="text-xs text-gray-400">{announcementBar.textColor}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
                <h5 className="text-xs font-bold text-gray-400 uppercase">Navigation</h5>
                <div className="space-y-3">
                    <label className="text-xs font-medium text-gray-500">Link Hover Style</label>
                    <div className="grid grid-cols-2 gap-2">
                        {NAV_LINK_STYLES.map(opt => (
                            <button
                                key={opt.value}
                                onClick={() => onThemeChange('header', { ...header, navLinkStyle: { ...(header.navLinkStyle || {}), activeIndicator: opt.value } })}
                                className={`px-3 py-2 text-xs border rounded-md transition-all text-center ${header.navLinkStyle?.activeIndicator === opt.value
                                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                    }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
