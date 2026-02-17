'use client';

import { useState } from 'react';
import { FiSave, FiChevronDown, FiChevronRight } from 'react-icons/fi';

/* ─── Card ─── */
export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 space-y-6 animate-fade-in ${className}`}>
      {children}
    </div>
  );
}

/* ─── SectionToggle ─── */
export function SectionToggle({ label, enabled, onChange, hint }) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
      <div>
        <span className="text-sm font-medium text-primary-900">{label}</span>
        {hint && <p className="text-xs text-gray-500 mt-0.5">{hint}</p>}
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600" />
      </label>
    </div>
  );
}

/* ─── Field ─── */
export function Field({ label, hint, children, className = '' }) {
  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-primary-900 mb-1.5">{label}</label>}
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

/* ─── TextInput ─── */
export function TextInput({ value, onChange, placeholder, type = 'text', className = '' }) {
  return (
    <input
      type={type}
      className={`input w-full ${className}`}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

/* ─── TextArea ─── */
export function TextArea({ value, onChange, placeholder, rows = 3, className = '' }) {
  return (
    <textarea
      className={`input w-full ${className}`}
      rows={rows}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

/* ─── ColorPicker ─── */
export function ColorPicker({ value, onChange, label }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-14 border border-primary-200 rounded cursor-pointer"
      />
      <div className="flex-1">
        {label && <span className="text-sm text-primary-900">{label}</span>}
        <span className="block text-xs text-gray-400 font-mono">{value || '#000000'}</span>
      </div>
    </div>
  );
}

/* ─── CollapsibleSection ─── */
export function CollapsibleSection({ title, icon, badge, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-primary-50/60 hover:bg-primary-50 transition-colors text-left"
      >
        {open ? <FiChevronDown className="w-4 h-4 text-gray-500" /> : <FiChevronRight className="w-4 h-4 text-gray-500" />}
        {icon && <span className="text-primary-700">{icon}</span>}
        <span className="font-medium text-sm text-primary-900 flex-1">{title}</span>
        {badge && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-200 text-primary-800">
            {badge}
          </span>
        )}
      </button>
      {open && <div className="p-4 space-y-4 border-t">{children}</div>}
    </div>
  );
}

/* ─── SaveButton ─── */
export function SaveButton({ onClick, saving, label = 'Save Changes' }) {
  return (
    <div className="pt-4 border-t flex justify-end">
      <button
        onClick={onClick}
        disabled={saving}
        className="btn btn-primary flex items-center gap-2"
      >
        <FiSave className="w-4 h-4" />
        {saving ? 'Saving...' : label}
      </button>
    </div>
  );
}

/* ─── TabButton ─── */
export function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 sm:px-6 py-3.5 font-medium text-sm transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
        active
          ? 'border-primary-900 text-primary-900 bg-primary-50'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
