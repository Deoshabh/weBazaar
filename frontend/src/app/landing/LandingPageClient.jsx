/**
 * Client wrapper for the landing page.
 * Needed because Three.js Canvas and all animation libraries require 'use client'.
 */
'use client';

import dynamic from 'next/dynamic';

// Dynamic import with SSR disabled — Three.js requires browser APIs
const LandingPage = dynamic(
  () => import('@/components/landing/LandingPage'),
  {
    ssr: false,
    loading: () => (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#2C2B29' }}
      >
        <p
          className="text-xs tracking-[0.4em] uppercase animate-pulse"
          style={{ color: 'rgba(212, 196, 176, 0.4)' }}
        >
          Preparing your experience...
        </p>
      </div>
    ),
  }
);

export default function LandingPageClient() {
  return <LandingPage />;
}
