'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const SPLASH_DURATION = 3000; // 3 seconds
const FADE_DURATION = 600;    // fade-out ms

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    // Show every time the site is opened
    // Begin fade-out a little before the end so it feels smooth
    const fadeTimer = setTimeout(() => setFading(true), SPLASH_DURATION - FADE_DURATION);
    // Fully unmount after fade completes
    const hideTimer = setTimeout(() => setVisible(false), SPLASH_DURATION);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to WeBazaar"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FBF8F4',          // --color-cream
        transition: `opacity ${FADE_DURATION}ms ease`,
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? 'none' : 'auto',
      }}
    >
      {/* Subtle decorative ring */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '420px',
          height: '420px',
          borderRadius: '50%',
          border: '1.5px solid #C9943A33',   // gold, low opacity
          animation: 'splash-ring 4s ease-out forwards',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          width: '560px',
          height: '560px',
          borderRadius: '50%',
          border: '1px solid #C9943A1A',
          animation: 'splash-ring 4s 0.4s ease-out forwards',
        }}
      />

      {/* Logo */}
      <div
        style={{
          animation: 'splash-rise 0.9s cubic-bezier(0.22,1,0.36,1) forwards',
          opacity: 0,
          marginBottom: '28px',
        }}
      >
        <Image
          src="/logo.png"
          alt="WeBazaar logo"
          width={160}
          height={160}
          priority
          style={{ objectFit: 'contain', borderRadius: '4px' }}
        />
      </div>

      {/* Site name */}
      <h1
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 'clamp(2rem, 5vw, 3.25rem)',
          fontWeight: 600,
          letterSpacing: '0.12em',
          color: '#1A1208',                   // --color-ink
          margin: '0 0 10px',
          animation: 'splash-rise 0.9s 0.15s cubic-bezier(0.22,1,0.36,1) forwards',
          opacity: 0,
          textAlign: 'center',
        }}
      >
        WeBazaar
      </h1>

      {/* Tagline */}
      <p
        style={{
          fontFamily: "'Roboto', system-ui, sans-serif",
          fontSize: 'clamp(0.8rem, 2vw, 1rem)',
          fontWeight: 300,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#C9943A',                   // --color-gold
          margin: 0,
          animation: 'splash-rise 0.9s 0.3s cubic-bezier(0.22,1,0.36,1) forwards',
          opacity: 0,
          textAlign: 'center',
        }}
      >
        Conscious Style, Delivered
      </p>

      {/* Keyframes injected inline via a style tag */}
      <style>{`
        @keyframes splash-rise {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes splash-ring {
          from { transform: scale(0.6); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>
    </div>
  );
}
