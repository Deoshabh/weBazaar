
import React from 'react';

const HEADER_VARIANTS = [
    { id: 'minimal', label: 'Minimal (Logo Left)' },
    { id: 'centered', label: 'Centered Logo' },
    { id: 'transparent', label: 'Transparent' },
];

export default function LayoutSection({ theme, onThemeChange }) {

    return (
        <div className="space-y-6">

            <div className="space-y-3">
                <label className="text-xs font-medium text-gray-500">Header Style</label>
                <div className="grid grid-cols-1 gap-2">
                    {HEADER_VARIANTS.map(variant => (
                        <button
                            key={variant.id}
                            onClick={() => onThemeChange('headerVariant', variant.id)}
                            className={`px-3 py-2 text-xs border rounded-md transition-all text-left ${theme.headerVariant === variant.id
                                ? 'bg-blue-50 border-blue-500 text-blue-700 font-medium'
                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                }`}
                        >
                            {variant.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-gray-500">Sticky Header</label>
                    <input
                        type="checkbox"
                        checked={theme.stickyHeader !== false}
                        onChange={(e) => onThemeChange('stickyHeader', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100">
                <label className="text-xs font-medium text-gray-500">Container Width</label>
                <select
                    value={theme.containerWidth || '1280px'}
                    onChange={(e) => onThemeChange('containerWidth', e.target.value)}
                    className="w-full text-sm border-gray-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="1024px">Small (1024px)</option>
                    <option value="1280px">Standard (1280px)</option>
                    <option value="1440px">Wide (1440px)</option>
                    <option value="100%">Full Width</option>
                </select>
            </div>
        </div>
    );
}
