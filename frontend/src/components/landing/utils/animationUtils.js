/**
 * Animation utility hooks and helpers for the Webazaar landing page.
 * Provides shared GSAP and scroll-tracking functionality.
 */
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook to track normalized scroll progress (0 → 1) across the full page.
 */
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return progress;
}

/**
 * Hook to track an element's visibility progress within the viewport.
 */
export function useElementScrollProgress(ref) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!ref.current) return;

    const handleScroll = () => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const elementTop = rect.top;
      const elementHeight = rect.height;

      // Progress from 0 (element enters bottom) to 1 (element exits top)
      const rawProgress = (windowHeight - elementTop) / (windowHeight + elementHeight);
      setProgress(Math.max(0, Math.min(1, rawProgress)));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [ref]);

  return progress;
}

/**
 * Hook for smooth mouse position tracking (normalized -1 to 1).
 */
export function useMouseParallax(intensity = 0.05) {
  const mouse = useRef({ x: 0, y: 0 });
  const smoothMouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const update = useCallback(() => {
    smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * intensity;
    smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * intensity;
    return { ...smoothMouse.current };
  }, [intensity]);

  return { mouse: smoothMouse, update };
}

/**
 * Easing functions for custom animations.
 */
export const easings = {
  easeOutExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  easeInOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  easeOutBack: (t) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeOutElastic: (t) => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
};

/**
 * Lerp utility.
 */
export function lerp(start, end, factor) {
  return start + (end - start) * factor;
}

/**
 * Map a value from one range to another.
 */
export function mapRange(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}
