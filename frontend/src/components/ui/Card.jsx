'use client';

import { forwardRef } from 'react';

/**
 * Card — weBazaar Design System
 *
 * Variants: product | content | stat | compact
 * Consistent radius, shadow, padding, hover lift
 */

const variantConfig = {
  product: {
    base: 'bg-white rounded-lg shadow-card overflow-hidden',
    hover: 'hover:shadow-card-hover hover:-translate-y-0.5',
    padding: '',
  },
  content: {
    base: 'bg-white rounded-xl shadow-card',
    hover: 'hover:shadow-card-hover hover:-translate-y-0.5',
    padding: 'p-6 md:p-8',
  },
  stat: {
    base: 'bg-white rounded-xl shadow-card h-[100px] flex items-center',
    hover: 'hover:shadow-card-hover',
    padding: 'px-5',
  },
  compact: {
    base: 'bg-white rounded-lg shadow-sm border border-sand/40',
    hover: 'hover:shadow-card hover:border-sand',
    padding: 'p-4',
  },
};

const Card = forwardRef(function Card(
  {
    children,
    variant = 'content',
    hoverable = true,
    as: Component = 'div',
    className = '',
    ...props
  },
  ref
) {
  const config = variantConfig[variant] || variantConfig.content;

  return (
    <Component
      ref={ref}
      className={[
        config.base,
        config.padding,
        'transition-all duration-normal ease-out-custom',
        hoverable ? config.hover : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </Component>
  );
});

Card.displayName = 'Card';
export default Card;
