'use client';

import { useState, useEffect } from 'react';

export default function PriceRangeSlider({ min, max, value, onChange }) {
  const [minValue, setMinValue] = useState(value?.min || min);
  const [maxValue, setMaxValue] = useState(value?.max || max);

  useEffect(() => {
    if (value) {
      setMinValue(value.min || min);
      setMaxValue(value.max || max);
    }
  }, [value, min, max]);

  const handleMinChange = (e) => {
    const newMin = Math.min(Number(e.target.value), maxValue - 1000);
    setMinValue(newMin);
  };

  const handleMaxChange = (e) => {
    const newMax = Math.max(Number(e.target.value), minValue + 1000);
    setMaxValue(newMax);
  };

  const handleMinBlur = () => {
    onChange({ min: minValue, max: maxValue });
  };

  const handleMaxBlur = () => {
    onChange({ min: minValue, max: maxValue });
  };

  const getSliderBackground = () => {
    const minPercent = ((minValue - min) / (max - min)) * 100;
    const maxPercent = ((maxValue - min) / (max - min)) * 100;
    return `linear-gradient(to right, #e5e7eb 0%, #e5e7eb ${minPercent}%, #8B4513 ${minPercent}%, #8B4513 ${maxPercent}%, #e5e7eb ${maxPercent}%, #e5e7eb 100%)`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-primary-600">₹{minValue.toLocaleString('en-IN')}</span>
        <span className="text-primary-600">₹{maxValue.toLocaleString('en-IN')}</span>
      </div>

      <div className="relative h-2">
        {/* Background track */}
        <div 
          className="absolute w-full h-2 rounded-full"
          style={{ background: getSliderBackground() }}
        />
        
        {/* Min slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={100}
          value={minValue}
          onChange={handleMinChange}
          onMouseUp={handleMinBlur}
          onTouchEnd={handleMinBlur}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-brown [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand-brown [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
        />
        
        {/* Max slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={100}
          value={maxValue}
          onChange={handleMaxChange}
          onMouseUp={handleMaxBlur}
          onTouchEnd={handleMaxBlur}
          className="absolute w-full h-2 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-brand-brown [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-brand-brown [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md"
        />
      </div>

      <div className="flex items-center gap-3 text-xs">
        <input
          type="number"
          value={minValue}
          onChange={handleMinChange}
          onBlur={handleMinBlur}
          min={min}
          max={maxValue - 1000}
          className="w-24 px-2 py-1 border border-primary-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-brown"
        />
        <span className="text-primary-400">to</span>
        <input
          type="number"
          value={maxValue}
          onChange={handleMaxChange}
          onBlur={handleMaxBlur}
          min={minValue + 1000}
          max={max}
          className="w-24 px-2 py-1 border border-primary-200 rounded focus:outline-none focus:ring-1 focus:ring-brand-brown"
        />
      </div>
    </div>
  );
}
