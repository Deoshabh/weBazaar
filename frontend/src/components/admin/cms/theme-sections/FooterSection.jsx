
import React from 'react';

const FOOTER_LAYOUTS = [
    { value: '4-col', label: 'Start 4 Columns' },
    { value: '2-col', label: 'Simple 2 Columns' },
    { value: 'centered', label: 'Centered' },
    { value: 'minimal', label: 'Minimal' },
];

export default function FooterSection({ theme, onThemeChange }) {

    const footer = theme.footer || {};

    const handleFooterChange = (key, value) => {
        onThemeChange('footer', { ...footer, [key]: value });
    };

    return (
        <div className="space-y-6">

            <div className="space-y-3">
                <label className="text-xs font-medium text-gray-500">Layout Style</label>
                <div className="grid grid-cols-2 gap-2">
                    {FOOTER_LAYOUTS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => handleFooterChange('layout', opt.value)}
                            className={`px-3 py-2 text-xs border rounded-md transition-all text-center ${footer.layout === opt.value
                                ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-gray-100">
                <h5 className="text-xs font-bold text-gray-400 uppercase">Colors</h5>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Background</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={footer.colors?.background || '#000000'}
                                onChange={(e) => handleFooterChange('colors', { ...footer.colors, background: e.target.value })}
                                className="w-8 h-8 border-none p-0 cursor-pointer rounded"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Text Color</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="color"
                                value={footer.colors?.text || '#ffffff'}
                                onChange={(e) => handleFooterChange('colors', { ...footer.colors, text: e.target.value })}
                                className="w-8 h-8 border-none p-0 cursor-pointer rounded"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-gray-100">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={footer.showNewsletter !== false}
                        onChange={(e) => handleFooterChange('showNewsletter', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Show Newsletter Signup</span>
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={footer.showSocialLinks !== false}
                        onChange={(e) => handleFooterChange('showSocialLinks', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">Show Social Links</span>
                </label>
            </div>
        </div>
    );
}
