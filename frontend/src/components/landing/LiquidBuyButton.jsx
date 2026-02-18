/**
 * LiquidBuyButton
 * 
 * A "Buy Now" / "Add to Cart" button with organic liquid morphing on hover
 * using Anime.js. On hover, the border-radius distorts randomly so it looks
 * like a water droplet. On click, ripple effect fills outward.
 */
'use client';

import { useRef, useCallback, useState } from 'react';
import anime from 'animejs';

export default function LiquidBuyButton({
  children = 'Add to Cart',
  onClick,
  variant = 'primary', // 'primary' | 'secondary'
  className = '',
  size = 'md', // 'sm' | 'md' | 'lg'
}) {
  const buttonRef = useRef(null);
  const rippleRef = useRef(null);
  const borderRadiusRef = useRef(null);
  const [isRippling, setIsRippling] = useState(false);

  const sizes = {
    sm: 'px-6 py-2.5 text-xs',
    md: 'px-10 py-4 text-sm',
    lg: 'px-14 py-5 text-base',
  };

  const variants = {
    primary: {
      bg: '#2C2B29',
      text: '#E6E2DD',
      hoverBg: '#3D2F28',
      rippleColor: 'rgba(212, 196, 176, 0.3)',
    },
    secondary: {
      bg: 'transparent',
      text: '#2C2B29',
      hoverBg: 'rgba(44, 43, 41, 0.05)',
      rippleColor: 'rgba(44, 43, 41, 0.1)',
    },
  };

  const style = variants[variant];

  const handleMouseEnter = useCallback(() => {
    if (!buttonRef.current) return;

    // Kill previous animation
    if (borderRadiusRef.current) {
      borderRadiusRef.current.pause();
    }

    // Generate organic, random border-radius values
    const generateBlobRadius = () => {
      const base = 40;
      const variance = 25;
      return Array.from({ length: 8 }, () =>
        Math.round(base + Math.random() * variance)
      );
    };

    const radii1 = generateBlobRadius();
    const radii2 = generateBlobRadius();

    borderRadiusRef.current = anime({
      targets: buttonRef.current,
      borderRadius: [
        `${radii1[0]}% ${radii1[1]}% ${radii1[2]}% ${radii1[3]}% / ${radii1[4]}% ${radii1[5]}% ${radii1[6]}% ${radii1[7]}%`,
        `${radii2[0]}% ${radii2[1]}% ${radii2[2]}% ${radii2[3]}% / ${radii2[4]}% ${radii2[5]}% ${radii2[6]}% ${radii2[7]}%`,
      ],
      duration: 2000,
      easing: 'easeInOutSine',
      direction: 'alternate',
      loop: true,
    });

    // Subtle scale pulse
    anime({
      targets: buttonRef.current,
      scale: 1.03,
      duration: 400,
      easing: 'easeOutBack',
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!buttonRef.current) return;

    // Kill the blob animation
    if (borderRadiusRef.current) {
      borderRadiusRef.current.pause();
      borderRadiusRef.current = null;
    }

    // Snap back to pill shape
    anime({
      targets: buttonRef.current,
      borderRadius: '999px',
      scale: 1,
      duration: 500,
      easing: 'easeOutElastic(1, 0.6)',
    });
  }, []);

  const handleClick = useCallback(
    (e) => {
      if (!buttonRef.current || !rippleRef.current) return;

      setIsRippling(true);

      const rect = buttonRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Position ripple at click point
      rippleRef.current.style.left = `${x}px`;
      rippleRef.current.style.top = `${y}px`;

      // Ripple expansion
      anime({
        targets: rippleRef.current,
        scale: [0, 4],
        opacity: [0.8, 0],
        duration: 800,
        easing: 'easeOutExpo',
        complete: () => setIsRippling(false),
      });

      // Button press feedback
      anime({
        targets: buttonRef.current,
        scale: [1.03, 0.97, 1],
        duration: 400,
        easing: 'easeOutCubic',
      });

      onClick?.(e);
    },
    [onClick]
  );

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`
        relative overflow-hidden cursor-pointer
        tracking-[0.2em] uppercase font-light
        transition-colors duration-300
        ${sizes[size]}
        ${className}
      `}
      style={{
        backgroundColor: style.bg,
        color: style.text,
        borderRadius: '999px',
        border: variant === 'secondary' ? '1px solid rgba(44, 43, 41, 0.2)' : 'none',
        fontFamily: "'Roboto', sans-serif",
        willChange: 'border-radius, transform',
      }}
    >
      {/* Ripple element */}
      <span
        ref={rippleRef}
        className="absolute w-20 h-20 rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2"
        style={{
          backgroundColor: style.rippleColor,
          transform: 'scale(0)',
          opacity: 0,
        }}
      />

      {/* Button content */}
      <span className="relative z-10 flex items-center gap-2 justify-center">
        {children}
      </span>
    </button>
  );
}
