'use client';

/**
 * Badge — weBazaar Design System
 *
 * Variants: success | error | warning | info | neutral | gold
 * Sizes:    sm | md
 */

const variantClasses = {
  success: 'bg-success-bg text-success',
  error: 'bg-error-bg text-error',
  warning: 'bg-warning-bg text-warning',
  info: 'bg-info-bg text-info',
  neutral: 'bg-linen text-walnut',
  gold: 'bg-gold-light/30 text-gold-dark',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[11px]',
  md: 'px-3 py-1 text-caption',
};

export default function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  ...props
}) {
  return (
    <span
      className={[
        'inline-flex items-center font-medium rounded-full whitespace-nowrap',
        variantClasses[variant] || variantClasses.neutral,
        sizeClasses[size] || sizeClasses.md,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </span>
  );
}
