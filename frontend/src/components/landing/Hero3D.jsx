/**
 * Hero3D
 * 
 * The immersive Three.js hero section. Renders a floating shoe in a void
 * of warm light with breathing particles and mouse-reactive parallax.
 * HDRI lighting simulates a Studio/Sunset environment.
 */
'use client';

import { Suspense, useRef, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';
import ShoeModel from './ShoeModel';
import BreathingParticles from './BreathingParticles';
import { useMouseParallax, useScrollProgress } from './utils/animationUtils';

function HeroScene({ scrollProgress }) {
  const { mouse, update } = useMouseParallax(0.08);
  const lightRef = useRef();

  useFrame(() => {
    const m = update();
    // Move key light slightly with mouse for living feel
    if (lightRef.current) {
      lightRef.current.position.x = 3 + m.x * 0.5;
      lightRef.current.position.y = 4 + m.y * 0.3;
    }
  });

  const explodeProgress = Math.max(0, (scrollProgress - 0.1) * 2.5);

  return (
    <>
      {/* Environment — warm studio/sunset HDRI */}
      <Environment preset="sunset" environmentIntensity={0.5} />

      {/* Ambient base */}
      <ambientLight intensity={0.3} color="#F5E6D3" />

      {/* Key light — warm amber */}
      <directionalLight
        ref={lightRef}
        position={[3, 4, 2]}
        intensity={1.2}
        color="#FFECD2"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Fill light — soft cool */}
      <directionalLight position={[-3, 2, -1]} intensity={0.4} color="#E8E4F0" />

      {/* Rim light — highlighting edges */}
      <pointLight position={[0, 3, -3]} intensity={0.8} color="#FFD4A0" distance={10} />

      {/* Bottom warm bounce */}
      <pointLight position={[0, -2, 0]} intensity={0.3} color="#D4A574" distance={6} />

      {/* Floating shoe */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
        <ShoeUpdate scrollProgress={scrollProgress} explodeProgress={explodeProgress} />
      </Float>

      {/* Contact shadow for grounding */}
      <ContactShadows
        position={[0, -1.2, 0]}
        opacity={0.35}
        scale={5}
        blur={2.5}
        far={4}
        color="#2C2B29"
      />

      {/* Breathing particles */}
      <BreathingParticles count={600} scrollProgress={scrollProgress} />

      {/* Fog for depth */}
      <fog attach="fog" args={['#2C2B29', 6, 18]} />
    </>
  );
}

/**
 * Wrapper component that feeds mouse data into ShoeModel via useFrame.
 */
function ShoeUpdate({ scrollProgress, explodeProgress }) {
  const { mouse, update } = useMouseParallax(0.06);
  const mouseState = useRef({ x: 0, y: 0 });

  useFrame(() => {
    const m = update();
    mouseState.current = m;
  });

  return (
    <ShoeModel
      rotationSpeed={0.2}
      mouseX={mouseState.current.x}
      mouseY={mouseState.current.y}
      explodeProgress={Math.min(explodeProgress, 1)}
    />
  );
}

export default function Hero3D() {
  const scrollProgress = useScrollProgress();

  return (
    <section className="relative w-full h-screen" style={{ background: '#2C2B29' }}>
      {/* Three.js Canvas */}
      <div className="absolute inset-0">
        <Canvas
          camera={{
            position: [0, 0.5, 4],
            fov: 40,
            near: 0.1,
            far: 50,
          }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.1,
          }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            <HeroScene scrollProgress={scrollProgress} />
          </Suspense>
        </Canvas>
      </div>

      {/* Hero text overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
        <div className="text-center px-6">
          {/* Overline */}
          <p
            className="text-xs tracking-[0.5em] uppercase mb-6 opacity-60 hero-overline"
            style={{ color: '#D4C4B0' }}
          >
            Chemical-Free &middot; Vegan Leather
          </p>

          {/* Main headline */}
          <h1
            className="text-5xl md:text-7xl lg:text-8xl font-light leading-none mb-6 hero-headline"
            style={{
              color: '#E6E2DD',
              fontFamily: "'Roboto', sans-serif",
              letterSpacing: '0.04em',
            }}
          >
            Walk in
            <br />
            <em className="font-normal italic">Stillness</em>
          </h1>

          {/* Subtitle */}
          <p
            className="text-sm md:text-base max-w-md mx-auto leading-relaxed mb-10 hero-subtitle"
            style={{ color: 'rgba(212, 196, 176, 0.7)' }}
          >
            Shoes crafted for meditative walking. Every step, a moment of presence.
          </p>

          {/* Scroll indicator */}
          <div
            className="mt-8 flex flex-col items-center hero-scroll-hint"
            style={{
              opacity: Math.max(0, 1 - scrollProgress * 5),
              transform: `translateY(${scrollProgress * 30}px)`,
              transition: 'opacity 0.3s',
            }}
          >
            <p
              className="text-xs tracking-[0.3em] uppercase mb-3"
              style={{ color: 'rgba(212, 196, 176, 0.4)' }}
            >
              Scroll to explore
            </p>
            <div className="w-px h-12 relative overflow-hidden">
              <div
                className="w-full h-full animate-pulse"
                style={{
                  background: 'linear-gradient(to bottom, rgba(212,196,176,0.5), transparent)',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, #E6E2DD, transparent)',
        }}
      />
    </section>
  );
}
