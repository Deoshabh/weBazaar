
import React from 'react';
import * as Slider from '@radix-ui/react-slider';

const FONT_OPTIONS = [
    { label: 'Inter (Sans)', value: 'var(--font-inter)' },
    { label: 'Roboto (Sans)', value: 'Roboto, sans-serif' },
    { label: 'Playfair (Serif)', value: 'Playfair Display, serif' },
    { label: 'Montserrat (Sans)', value: 'Montserrat, sans-serif' },
    { label: 'Open Sans (Sans)', value: 'Open Sans, sans-serif' },
];

export default function TypographySection({ theme, onThemeChange }) {

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <label className="text-xs font-medium text-gray-500">Heading Font</label>
                <select
                    value={theme.fontFamily || 'var(--font-inter)'}
                    onChange={(e) => onThemeChange('fontFamily', e.target.value)}
                    className="w-full text-sm border-gray-200 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    {FONT_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-3">
                <label className="text-xs font-medium text-gray-500">Base Font Scale</label>
                <div className="flex items-center gap-4">
                    <Slider.Root
                        defaultValue={[theme.fontScale || 1]}
                        max={1.4}
                        min={0.8}
                        step={0.05}
                        onValueChange={(val) => onThemeChange('fontScale', val[0])}
                        className="relative flex items-center select-none touch-none w-full h-5"
                    >
                        <Slider.Track className="bg-gray-200 relative grow rounded-full h-[3px]">
                            <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                        </Slider.Track>
                        <Slider.Thumb
                            className="block w-4 h-4 bg-white border border-gray-300 shadow rounded-[10px] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Font Scale"
                        />
                    </Slider.Root>
                    <span className="text-xs tabular-nums text-gray-600 w-8 text-right">
                        {((theme.fontScale || 1) * 100).toFixed(0)}%
                    </span>
                </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-gray-100">
                <label className="text-xs font-medium text-gray-500">Global Radius</label>
                <div className="flex items-center gap-4">
                    <Slider.Root
                        defaultValue={[parseInt(theme.borderRadius) || 8]}
                        max={32}
                        min={0}
                        step={2}
                        onValueChange={(val) => onThemeChange('borderRadius', `${val[0]}px`)}
                        className="relative flex items-center select-none touch-none w-full h-5"
                    >
                        <Slider.Track className="bg-gray-200 relative grow rounded-full h-[3px]">
                            <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                        </Slider.Track>
                        <Slider.Thumb
                            className="block w-4 h-4 bg-white border border-gray-300 shadow rounded-[10px] hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            aria-label="Font Scale"
                        />
                    </Slider.Root>
                    <span className="text-xs tabular-nums text-gray-600 w-8 text-right">
                        {parseInt(theme.borderRadius) || 8}px
                    </span>
                </div>
            </div>
        </div>
    );
}
