/**
 * AnatomyOfComfort
 * 
 * A scrollytelling section using React Three Fiber + GSAP ScrollTrigger.
 * The camera orbits from a side view to the sole while the shoe "explodes"
 * into layers. Labels animate in with connector lines.
 * Background transitions from Cream to Sage Green.
 */
'use client';

import { useRef, useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ShoeModel from './ShoeModel';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Anatomy labels that appear during the explode animation.
 */
const ANATOMY_LABELS = [
  {
    id: 'sole',
    title: 'Chemical-Free Sole',
    description: 'Natural rubber compound with zero harmful chemicals. Provides meditative grip on every surface.',
    position: [0, -1.5, 0],
    lineStart: [0, -0.8, 0],
    triggerAt: 0.15,
  },
  {
    id: 'insole',
    title: 'Breathable Vegan Skin',
    description: 'Cork and plant-based foam insole. Molds to your foot\'s natural arch over time.',
    position: [1.8, 0.3, 0],
    lineStart: [0.5, 0.1, 0],
    triggerAt: 0.35,
  },
  {
    id: 'upper',
    title: 'Chemical-Free Arch Support',
    description: 'Bio-based upper made from pineapple leaf fiber and natural latex — soft, porous, alive.',
    position: [-1.8, 0.8, 0],
    lineStart: [-0.5, 0.3, 0],
    triggerAt: 0.55,
  },
  {
    id: 'heel',
    title: 'Grounding Heel Counter',
    description: 'Reinforced with recycled materials. Designed for stability during slow, mindful walks.',
    position: [1.5, 1.2, -0.5],
    lineStart: [0, 0.2, -0.8],
    triggerAt: 0.7,
  },
];

function AnatomyScene({ scrollProgress }) {
  const { camera } = useThree();
  const groupRef = useRef();

  // Camera orbit based on scroll
  useFrame(() => {
    const t = scrollProgress;
    // Orbit: side → front → bottom view
    const angle = t * Math.PI * 0.8; // 0 to ~144 degrees
    const radius = 4 - t * 0.5;
    const height = 0.5 + t * 2.5; // Rise up to look at sole

    camera.position.x = Math.sin(angle) * radius;
    camera.position.z = Math.cos(angle) * radius;
    camera.position.y = height;
    camera.lookAt(0, 0, 0);
  });

  const explodeProgress = Math.min(1, scrollProgress * 1.5);

  return (
    <>
      <Environment preset="sunset" environmentIntensity={0.4} />
      <ambientLight intensity={0.4} color="#F5E6D3" />
      <directionalLight position={[3, 5, 2]} intensity={1.0} color="#FFECD2" />
      <directionalLight position={[-2, 3, -1]} intensity={0.3} color="#E8E4F0" />
      <pointLight position={[0, -2, 0]} intensity={0.4} color="#D4A574" distance={8} />

      <group ref={groupRef}>
        <ShoeModel
          rotationSpeed={0.05}
          mouseX={0}
          mouseY={0}
          explodeProgress={explodeProgress}
          color="#8B7355"
          soleColor="#3D2F28"
        />
      </group>

      {/* 3D Labels that float in space */}
      {ANATOMY_LABELS.map((label) => {
        const visible = scrollProgress >= label.triggerAt;
        return (
          <group key={label.id}>
            {/* Connector line */}
            {visible && (
              <line>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    count={2}
                    array={new Float32Array([
                      ...label.lineStart,
                      ...label.position,
                    ])}
                    itemSize={3}
                  />
                </bufferGeometry>
                <lineBasicMaterial color="#D4C4B0" opacity={0.6} transparent linewidth={1} />
              </line>
            )}

            {/* HTML label */}
            {visible && (
              <Html
                position={label.position}
                center
                distanceFactor={5}
                style={{
                  opacity: visible ? 1 : 0,
                  transition: 'opacity 0.8s ease',
                  pointerEvents: 'none',
                }}
              >
                <div className="w-48 text-center">
                  <div
                    className="w-2 h-2 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: '#D4C4B0' }}
                  />
                  <h4
                    className="text-xs font-medium tracking-widest uppercase mb-1"
                    style={{
                      color: '#2C2B29',
                      fontFamily: "'Roboto', sans-serif",
                      fontSize: '11px',
                    }}
                  >
                    {label.title}
                  </h4>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: 'rgba(44, 43, 41, 0.7)', fontSize: '10px' }}
                  >
                    {label.description}
                  </p>
                </div>
              </Html>
            )}
          </group>
        );
      })}

      <ContactShadows
        position={[0, -1.8, 0]}
        opacity={0.25}
        scale={6}
        blur={3}
        far={4}
        color="#2C2B29"
      />
      <fog attach="fog" args={['#E6E2DD', 8, 20]} />
    </>
  );
}

export default function AnatomyOfComfort() {
  const sectionRef = useRef(null);
  const canvasContainerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [bgColor, setBgColor] = useState('#E6E2DD');
  const headingsRef = useRef([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !sectionRef.current) return;

    // Main scroll trigger for the section
    const trigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom bottom',
      pin: canvasContainerRef.current,
      scrub: 1,
      onUpdate: (self) => {
        setScrollProgress(self.progress);

        // Background color transition: Cream → Sage Green
        const cream = new THREE.Color('#E6E2DD');
        const sage = new THREE.Color('#C5D1C5');
        const mixed = cream.clone().lerp(sage, self.progress);
        setBgColor(`#${mixed.getHexString()}`);
      },
    });

    // Staggered heading animations
    headingsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.fromTo(
        el,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            end: 'top 50%',
            scrub: false,
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    return () => {
      trigger.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: '400vh', background: bgColor, transition: 'background-color 0.1s' }}
    >
      {/* Sticky 3D Canvas */}
      <div
        ref={canvasContainerRef}
        className="w-full h-screen sticky top-0"
        style={{ background: bgColor }}
      >
        <Canvas
          camera={{ position: [4, 0.5, 0], fov: 35, near: 0.1, far: 50 }}
          gl={{
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.0,
          }}
          dpr={[1, 1.5]}
        >
          <Suspense fallback={null}>
            <AnatomyScene scrollProgress={scrollProgress} />
          </Suspense>
        </Canvas>

        {/* Section heading overlay */}
        <div className="absolute top-12 left-0 right-0 text-center pointer-events-none z-10">
          <p
            ref={(el) => (headingsRef.current[0] = el)}
            className="text-xs tracking-[0.5em] uppercase mb-3 opacity-0"
            style={{ color: 'rgba(44, 43, 41, 0.5)' }}
          >
            The Anatomy of Comfort
          </p>
          <h2
            ref={(el) => (headingsRef.current[1] = el)}
            className="text-4xl md:text-5xl lg:text-6xl font-light opacity-0"
            style={{
              color: '#2C2B29',
              fontFamily: "'Roboto', sans-serif",
              letterSpacing: '0.02em',
            }}
          >
            Every Layer,{' '}
            <em className="italic font-normal">Intentional</em>
          </h2>
        </div>

        {/* Progress indicator */}
        <div className="absolute right-8 top-1/2 -translate-y-1/2 z-10">
          <div className="flex flex-col items-center gap-3">
            {ANATOMY_LABELS.map((label, i) => (
              <div key={label.id} className="flex items-center gap-3">
                <span
                  className="text-[9px] tracking-[0.2em] uppercase text-right w-20 transition-opacity duration-500"
                  style={{
                    color: scrollProgress >= label.triggerAt ? '#2C2B29' : 'rgba(44,43,41,0.2)',
                    fontFamily: "'Roboto', sans-serif",
                  }}
                >
                  {label.title.split(' ').slice(-2).join(' ')}
                </span>
                <div
                  className="w-1.5 h-1.5 rounded-full transition-all duration-500"
                  style={{
                    backgroundColor:
                      scrollProgress >= label.triggerAt ? '#8B7355' : 'rgba(44,43,41,0.15)',
                    transform: scrollProgress >= label.triggerAt ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
