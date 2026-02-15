
import React from 'react';

const PAGE_TRANSITIONS = [
    { value: 'none', label: 'None' },
    { value: 'fade', label: 'Fade' },
    { value: 'slide', label: 'Slide' },
];

const SCROLL_ANIMATIONS = [
    { value: 'none', label: 'None' },
    { value: 'fade-in', label: 'Fade In' },
    { value: 'slide-up', label: 'Slide Up' },
    { value: 'scale-in', label: 'Scale In' },
];

export default function EffectsSection({ theme, onThemeChange }) {

    const effects = theme.effects || {};

    const handleEffectsChange = (key, value) => {
        onThemeChange('effects', { ...effects, [key]: value });
    };

    return (
        <div className="space-y-6">

            <div className="space-y-3">
                <h5 className="text-xs font-bold text-gray-400 uppercase">Page Transitions</h5>
                <select
                    value={effects.pageTransitions || 'fade'}
                    onChange={(e) => handleEffectsChange('pageTransitions', e.target.value)}
                    className="w-full text-sm border-gray-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    {PAGE_TRANSITIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100">
                <h5 className="text-xs font-bold text-gray-400 uppercase">Scroll Animations</h5>
                <div className="space-y-2">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={effects.scrollAnimations !== false}
                            onChange={(e) => handleEffectsChange('scrollAnimations', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Enable on Scroll</span>
                    </label>

                    {effects.scrollAnimations !== false && (
                        <select
                            value={effects.scrollAnimationType || 'fade-in'}
                            onChange={(e) => handleEffectsChange('scrollAnimationType', e.target.value)}
                            className="w-full text-sm border-gray-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 mt-2"
                        >
                            {SCROLL_ANIMATIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100">
                <h5 className="text-xs font-bold text-gray-400 uppercase">Interaction</h5>
                <div className="space-y-2">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={effects.customCursor || false}
                            onChange={(e) => handleEffectsChange('customCursor', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Custom Cursor</span>
                    </label>
                </div>
                {effects.customCursor && (
                    <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Cursor Color</label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={effects.customCursorColor || '#000000'}
                                    onChange={(e) => handleEffectsChange('customCursorColor', e.target.value)}
                                    className="w-8 h-8 border-none p-0 cursor-pointer rounded"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Size (px)</label>
                            <input
                                type="number"
                                value={effects.customCursorSize || 20}
                                onChange={(e) => handleEffectsChange('customCursorSize', parseInt(e.target.value))}
                                className="w-full text-xs border-gray-200 rounded"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
