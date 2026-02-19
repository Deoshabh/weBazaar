'use client';

import { useState, useId, forwardRef } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

/**
 * Input — weBazaar Design System
 *
 * States: default | focus | filled | error | disabled
 * Features: floating label, error message, left/right icons, password toggle
 */

const Input = forwardRef(function Input(
  {
    label,
    type = 'text',
    error,
    disabled = false,
    leftIcon = null,
    rightIcon = null,
    className = '',
    wrapperClassName = '',
    id: externalId,
    value,
    defaultValue,
    onChange,
    onFocus,
    onBlur,
    required = false,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = externalId || generatedId;
  const errorId = `${inputId}-error`;

  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue || '');

  // Determine controlled vs uncontrolled
  const currentValue = value !== undefined ? value : internalValue;
  const isFilled = currentValue != null && String(currentValue).length > 0;
  const isFloating = focused || isFilled;

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const handleFocus = (e) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  const handleChange = (e) => {
    if (value === undefined) {
      setInternalValue(e.target.value);
    }
    onChange?.(e);
  };

  return (
    <div className={`relative ${wrapperClassName}`}>
      <div className="relative">
        {/* Left Icon */}
        {leftIcon && (
          <span
            className={[
              'absolute left-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none',
              'transition-colors duration-fast',
              error ? 'text-error' : focused ? 'text-espresso' : 'text-caramel',
            ].join(' ')}
            aria-hidden="true"
          >
            {leftIcon}
          </span>
        )}

        {/* Input */}
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          disabled={disabled}
          value={currentValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          aria-required={required}
          placeholder=" "
          className={[
            'peer w-full rounded-md border bg-white outline-none',
            'transition-all duration-normal ease-out-custom',
            // Padding: adjust for icons
            leftIcon ? 'pl-11' : 'pl-4',
            isPassword || rightIcon ? 'pr-11' : 'pr-4',
            'pt-5 pb-2',
            // States
            error
              ? 'border-error focus:border-error focus:ring-2 focus:ring-error/20'
              : disabled
              ? 'border-sand bg-linen text-walnut cursor-not-allowed'
              : 'border-sand focus:border-espresso focus:ring-2 focus:ring-espresso/12',
            'text-ink text-body',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />

        {/* Floating Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={[
              'absolute left-0 pointer-events-none',
              'transition-all duration-normal ease-out-custom',
              leftIcon ? 'ml-11' : 'ml-4',
              // Floating position
              isFloating
                ? 'top-1.5 text-caption font-medium'
                : 'top-1/2 -translate-y-1/2 text-body',
              // Color
              error
                ? 'text-error'
                : focused
                ? 'text-espresso'
                : 'text-caramel',
              disabled ? 'text-sand' : '',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {label}
            {required && <span className="text-error ml-0.5">*</span>}
          </label>
        )}

        {/* Right Icon / Password Toggle */}
        {isPassword ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-caramel hover:text-espresso transition-colors duration-fast"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
          </button>
        ) : rightIcon ? (
          <span
            className={[
              'absolute right-4 top-1/2 -translate-y-1/2 flex items-center pointer-events-none',
              error ? 'text-error' : 'text-caramel',
            ].join(' ')}
            aria-hidden="true"
          >
            {rightIcon}
          </span>
        ) : null}
      </div>

      {/* Error Message */}
      {error && (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 text-body-sm text-error flex items-center gap-1"
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
