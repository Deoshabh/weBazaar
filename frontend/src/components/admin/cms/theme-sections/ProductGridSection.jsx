
import React from 'react';

export default function ProductGridSection({ theme, onThemeChange }) {

    const products = theme.products || {};

    const handleProductChange = (key, value) => {
        onThemeChange('products', { ...products, [key]: value });
    };

    return (
        <div className="space-y-6">

            <div className="space-y-3">
                <label className="text-xs font-medium text-gray-500">Card Style</label>
                <select
                    value={products.cardStyle || 'shadow'}
                    onChange={(e) => handleProductChange('cardStyle', e.target.value)}
                    className="w-full text-sm border-gray-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="minimal">Minimal (No Border)</option>
                    <option value="shadow">Card Shadow</option>
                    <option value="bordered">Bordered</option>
                    <option value="glass">Glassmorphism</option>
                </select>
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100">
                <label className="text-xs font-medium text-gray-500">Hover Effect</label>
                <select
                    value={products.hoverEffect || 'lift'}
                    onChange={(e) => handleProductChange('hoverEffect', e.target.value)}
                    className="w-full text-sm border-gray-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="none">None</option>
                    <option value="lift">Lift Up</option>
                    <option value="zoom">Zoom Image</option>
                    <option value="color-shift">Color Shift</option>
                </select>
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100">
                <h5 className="text-xs font-bold text-gray-400 uppercase">Badges & Info</h5>
                <div className="space-y-2">
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={products.showSaleBadge !== false}
                            onChange={(e) => handleProductChange('showSaleBadge', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Show Sale Badge</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={products.showRating !== false}
                            onChange={(e) => handleProductChange('showRating', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Show Star Rating</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={products.showInstallmentText !== false}
                            onChange={(e) => handleProductChange('showInstallmentText', e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Show "Pay in 3" Text</span>
                    </label>
                </div>
            </div>
        </div>
    );
}
