/**
 * LandingPage
 * 
 * Main assembled landing page for Webazaar.
 * Brings together all sections: Loader → Hero3D → Anatomy → Features → Collection → Footer.
 * The entire experience uses the "Organic Levitation" concept — weightless, drifting content.
 */
'use client';

import { useState, useRef, useEffect, Suspense, lazy } from 'react';
import MeditativeBreathLoader from './MeditativeBreathLoader';
import LandingNavbar from './LandingNavbar';
import PageTransition from './PageTransition';
import LandingFooter from './LandingFooter';

// Lazy load heavy 3D components for performance
const Hero3D = lazy(() => import('./Hero3D'));
const AnatomyOfComfort = lazy(() => import('./AnatomyOfComfort'));
const FeaturesSection = lazy(() => import('./FeaturesSection'));
const CollectionSection = lazy(() => import('./CollectionSection'));

/**
 * Lightweight fallback while 3D components load.
 */
function SectionFallback({ height = '100vh' }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ height, backgroundColor: '#2C2B29' }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="w-8 h-8 rounded-full animate-pulse"
          style={{ backgroundColor: 'rgba(212, 196, 176, 0.2)' }}
        />
        <p
          className="text-xs tracking-[0.3em] uppercase"
          style={{ color: 'rgba(212, 196, 176, 0.3)' }}
        >
          Loading...
        </p>
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const transitionRef = useRef(null);

  const handleLoaderComplete = () => {
    setIsLoaded(true);
    // Small delay then reveal content
    setTimeout(() => setShowContent(true), 100);
  };

  // Smooth scroll behavior for the landing page
  useEffect(() => {
    // Load the Cormorant Garamond font
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div
      className="relative"
      style={{
        backgroundColor: '#2C2B29',
        overflow: showContent ? 'visible' : 'hidden',
      }}
    >
      {/* Pre-loader */}
      {!isLoaded && <MeditativeBreathLoader onComplete={handleLoaderComplete} />}

      {/* Page transition overlay */}
      <PageTransition ref={transitionRef} color="#2C2B29" />

      {/* Navigation */}
      {showContent && <LandingNavbar />}

      {/* Main content */}
      <div
        style={{
          opacity: showContent ? 1 : 0,
          transition: 'opacity 1.2s ease-in-out',
        }}
      >
        {/* ━━━━━ HERO — Immersive 3D ━━━━━ */}
        <Suspense fallback={<SectionFallback height="100vh" />}>
          <Hero3D />
        </Suspense>

        {/* ━━━━━ ANATOMY — Scrollytelling ━━━━━ */}
        <div id="anatomy">
          <Suspense fallback={<SectionFallback height="400vh" />}>
            <AnatomyOfComfort />
          </Suspense>
        </div>

        {/* ━━━━━ FEATURES — GSAP ━━━━━ */}
        <Suspense fallback={<SectionFallback height="200vh" />}>
          <FeaturesSection />
        </Suspense>

        {/* ━━━━━ COLLECTION — Product Grid ━━━━━ */}
        <Suspense fallback={<SectionFallback height="100vh" />}>
          <CollectionSection />
        </Suspense>

        {/* ━━━━━ FOOTER ━━━━━ */}
        <LandingFooter />
      </div>
    </div>
  );
}
