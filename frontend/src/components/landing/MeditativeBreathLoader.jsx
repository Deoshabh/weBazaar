/**
 * MeditativeBreathLoader
 * 
 * A pre-loader that draws a shoe outline via SVG stroke-dashoffset,
 * pulsing with the rhythm of a slow deep breath (4s in, 4s out).
 * Fades out to reveal the site once loading is complete.
 */
'use client';

import { useEffect, useRef, useState } from 'react';
import anime from 'animejs';

export default function MeditativeBreathLoader({ onComplete }) {
  const containerRef = useRef(null);
  const pathRef = useRef(null);
  const textRef = useRef(null);
  const breathCircleRef = useRef(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const path = pathRef.current;
    if (!path) return;

    const pathLength = path.getTotalLength();
    path.style.strokeDasharray = pathLength;
    path.style.strokeDashoffset = pathLength;

    // Main shoe outline draw animation — synchronized with breath rhythm
    const drawTimeline = anime.timeline({
      easing: 'easeInOutSine',
      complete: () => {
        // Fade out the loader
        anime({
          targets: containerRef.current,
          opacity: [1, 0],
          scale: [1, 1.05],
          duration: 800,
          easing: 'easeInOutQuad',
          complete: () => {
            setIsVisible(false);
            onComplete?.();
          },
        });
      },
    });

    // Draw the shoe outline — 8 seconds total (one full breath cycle)
    drawTimeline.add({
      targets: path,
      strokeDashoffset: [pathLength, 0],
      duration: 4000, // Inhale — draw in
      easing: 'easeInOutSine',
    });

    // Brief hold
    drawTimeline.add({
      targets: path,
      opacity: [1, 0.8, 1],
      duration: 1000,
      easing: 'easeInOutSine',
    });

    // Exhale — fill glow
    drawTimeline.add({
      targets: path,
      strokeWidth: [1.5, 2.5, 1.5],
      duration: 4000,
      easing: 'easeInOutSine',
    }, '-=1000');

    // Breathing circle animation
    anime({
      targets: breathCircleRef.current,
      scale: [1, 1.4, 1],
      opacity: [0.3, 0.7, 0.3],
      duration: 8000,
      easing: 'easeInOutSine',
      loop: true,
    });

    // Staggered text reveal
    anime({
      targets: textRef.current?.children,
      opacity: [0, 1],
      translateY: [20, 0],
      delay: anime.stagger(200, { start: 500 }),
      duration: 1200,
      easing: 'easeOutExpo',
    });
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ backgroundColor: '#2C2B29' }}
    >
      {/* Breathing circle behind the shoe */}
      <div
        ref={breathCircleRef}
        className="absolute rounded-full"
        style={{
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(212, 196, 176, 0.15) 0%, transparent 70%)',
        }}
      />

      {/* SVG Shoe Outline */}
      <svg
        width="200"
        height="160"
        viewBox="0 0 200 160"
        fill="none"
        className="relative z-10"
      >
        <path
          ref={pathRef}
          d="M 30 120 
             C 30 120 25 100 30 80 
             C 35 60 40 45 55 35 
             C 70 25 85 20 100 20 
             C 115 20 130 22 145 30 
             C 160 38 170 50 175 65 
             C 180 80 178 95 175 105 
             L 175 110 
             C 175 110 178 115 180 118 
             C 182 121 185 125 185 128 
             C 185 132 182 136 175 138 
             L 50 140 
             C 40 140 32 135 30 130 
             C 28 125 30 120 30 120 Z
             M 55 35 C 55 35 65 55 60 80
             M 100 20 C 100 20 95 45 100 75
             M 145 30 C 145 30 140 55 145 80
             M 30 105 L 175 105"
          stroke="#D4C4B0"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.9"
        />
      </svg>

      {/* Brand Text */}
      <div ref={textRef} className="mt-10 text-center relative z-10">
        <p
          className="text-xs tracking-[0.4em] uppercase mb-2"
          style={{ color: 'rgba(212, 196, 176, 0.5)' }}
        >
          Breathe
        </p>
        <h1
          className="text-2xl tracking-[0.2em] font-light"
          style={{
            color: '#D4C4B0',
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          WEBAZAAR
        </h1>
        <div
          className="mt-4 mx-auto"
          style={{
            width: '40px',
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(212,196,176,0.5), transparent)',
          }}
        />
      </div>
    </div>
  );
}
