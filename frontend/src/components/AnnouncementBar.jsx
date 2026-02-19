'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { FiX, FiTruck, FiPercent, FiGift, FiStar } from 'react-icons/fi';
import { useSiteSettings } from '@/context/SiteSettingsContext';

/**
 * AnnouncementBar — bg-espresso with marquee scroll when text overflows.
 * Respects admin colours via inline style but defaults to design system tokens.
 * Dismiss saves to sessionStorage keyed by content hash.
 */
export default function AnnouncementBar() {
  const { settings } = useSiteSettings();
  const announcement = settings.announcementBar || {};
  const [dismissed, setDismissed] = useState(false);
  const [needsScroll, setNeedsScroll] = useState(false);
  const textRef = useRef(null);
  const containerRef = useRef(null);

  const storageKey = useMemo(() => {
    const seed = `${announcement.text || ''}::${announcement.link || ''}`;
    return `announcement-dismissed-${seed}`;
  }, [announcement.text, announcement.link]);

  // Check session storage for previous dismiss
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setDismissed(Boolean(sessionStorage.getItem(storageKey)));
  }, [storageKey]);

  // Detect overflow for marquee
  useEffect(() => {
    if (!textRef.current || !containerRef.current) return;
    const check = () => {
      const textW = textRef.current?.scrollWidth || 0;
      const containerW = containerRef.current?.clientWidth || 0;
      setNeedsScroll(textW > containerW);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [announcement.text]);

  if (!announcement.enabled) return null;
  if (announcement.dismissible && dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(storageKey, '1');
    }
  };

  // Pick a contextual icon based on keyword hints
  const getIcon = () => {
    const txt = (announcement.text || '').toLowerCase();
    if (txt.includes('ship') || txt.includes('delivery') || txt.includes('free')) return FiTruck;
    if (txt.includes('off') || txt.includes('sale') || txt.includes('discount') || txt.includes('%')) return FiPercent;
    if (txt.includes('gift') || txt.includes('reward')) return FiGift;
    return FiStar;
  };
  const Icon = getIcon();

  // Determine colours — prefer admin-set, fallback to design system
  const bgStr = announcement.backgroundColor || undefined;
  const fgStr = announcement.textColor || undefined;
  const useAdminColours = Boolean(bgStr || fgStr);

  const TextContent = (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <Icon className="w-3.5 h-3.5 flex-shrink-0 opacity-70" />
      <span>{announcement.text}</span>
      <span className="opacity-30 mx-4 hidden sm:inline">•</span>
      <Icon className="w-3.5 h-3.5 flex-shrink-0 opacity-70 hidden sm:inline" />
      <span className="hidden sm:inline">{announcement.text}</span>
    </span>
  );

  return (
    <div
      className={[
        'relative overflow-hidden',
        !useAdminColours ? 'bg-espresso text-cream' : '',
        'transition-colors duration-normal',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        ...(bgStr ? { backgroundColor: bgStr } : {}),
        ...(fgStr ? { color: fgStr } : {}),
      }}
      role="status"
      aria-live="polite"
    >
      {/* Content strip */}
      <div
        ref={containerRef}
        className="flex items-center justify-center h-9 sm:h-8 px-10 overflow-hidden"
      >
        <div
          ref={textRef}
          className={[
            'text-[11px] sm:text-xs font-medium tracking-[0.1em] uppercase',
            needsScroll ? 'animate-marquee' : '',
          ].join(' ')}
        >
          {announcement.link ? (
            <Link
              href={announcement.link}
              className="hover:underline underline-offset-2"
            >
              {TextContent}
            </Link>
          ) : (
            TextContent
          )}
        </div>
      </div>

      {/* Dismiss */}
      {announcement.dismissible !== false && (
        <button
          onClick={handleDismiss}
          className={[
            'absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2',
            'w-6 h-6 flex items-center justify-center rounded-full',
            'transition-colors duration-fast',
            !useAdminColours
              ? 'hover:bg-white/10 text-cream/70 hover:text-cream'
              : 'hover:bg-black/10',
          ].join(' ')}
          aria-label="Dismiss announcement"
        >
          <FiX className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
