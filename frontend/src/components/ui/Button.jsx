'use client';

import { forwardRef } from 'react';

/**
 * Button — weBazaar Design System
 *
 * Variants: primary | secondary | ghost | danger | gold
 * Sizes:    sm | md | lg
 * States:   default | hover | active | loading | disabled
 */

const variantClasses = {
  primary: [
    'bg-espresso text-white',
    'hover:bg-ink hover:shadow-md hover:-translate-y-0.5',
    'active:translate-y-0 active:shadow-sm',
    'disabled:bg-sand disabled:text-walnut disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0',
  ].join(' '),
  secondary: [
    'border-2 border-espresso text-espresso bg-transparent',
    'hover:bg-espresso hover:text-white hover:shadow-md hover:-translate-y-0.5',
    'active:translate-y-0 active:shadow-sm',
    'disabled:border-sand disabled:text-sand disabled:cursor-not-allowed disabled:translate-y-0',
  ].join(' '),
  ghost: [
    'bg-transparent text-espresso',
    'hover:bg-linen',
    'active:bg-sand/40',
    'disabled:text-sand disabled:cursor-not-allowed disabled:bg-transparent',
  ].join(' '),
  danger: [
    'bg-error text-white',
    'hover:bg-error/90 hover:shadow-md hover:-translate-y-0.5',
    'active:translate-y-0 active:shadow-sm',
    'disabled:bg-error/40 disabled:cursor-not-allowed disabled:translate-y-0',
  ].join(' '),
  gold: [
    'bg-gold text-white',
    'hover:bg-gold-dark hover:shadow-md hover:-translate-y-0.5',
    'active:translate-y-0 active:shadow-sm',
    'disabled:bg-gold-light disabled:text-white/70 disabled:cursor-not-allowed disabled:translate-y-0',
  ].join(' '),
};

const sizeClasses = {
  sm: 'px-4 py-2 text-body-sm gap-1.5 rounded-md',
  md: 'px-6 py-3 text-body gap-2 rounded-md',
  lg: 'px-8 py-4 text-body-lg gap-2.5 rounded-lg',
};

const Spinner = ({ className = '' }) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const spinnerSizeMap = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const Button = forwardRef(function Button(
  {
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    leftIcon = null,
    rightIcon = null,
    className = '',
    type = 'button',
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-medium',
        'transition-all duration-normal ease-out-custom',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        fullWidth ? 'w-full' : '',
        loading ? 'pointer-events-none' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {loading ? (
        <>
          <Spinner className={spinnerSizeMap[size]} />
          <span className="opacity-0 flex items-center gap-2">
            {leftIcon}
            {children}
            {rightIcon}
          </span>
          {/* Invisible content preserves button width */}
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
