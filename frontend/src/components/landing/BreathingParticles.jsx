/**
 * BreathingParticles
 * 
 * A subtle, shifting particle field in the Three.js background that reacts
 * to scroll position, representing "breath". Uses noise-based movement.
 */
'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function BreathingParticles({ count = 800, scrollProgress = 0 }) {
  const meshRef = useRef();
  const scrollRef = useRef(0);

  // Smoothly interpolate scroll
  scrollRef.current += (scrollProgress - scrollRef.current) * 0.05;

  const { positions, randoms, sizes } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Distribute in a sphere-ish volume
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 5;

      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = r * Math.cos(phi) - 2;

      randoms[i3] = Math.random();
      randoms[i3 + 1] = Math.random();
      randoms[i3 + 2] = Math.random();

      sizes[i] = Math.random() * 0.03 + 0.005;
    }

    return { positions, randoms, sizes };
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();
    const geo = meshRef.current.geometry;
    const posArray = geo.attributes.position.array;
    const randomArray = randoms;

    // Breath cycle: 4 seconds in, 4 seconds out
    const breathPhase = Math.sin(time * 0.39) * 0.5 + 0.5; // ~8s period
    const scroll = scrollRef.current;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const rx = randomArray[i3];
      const ry = randomArray[i3 + 1];
      const rz = randomArray[i3 + 2];

      // Base orbital motion
      const angle = time * (0.05 + rx * 0.1) + rx * Math.PI * 2;
      const baseX = positions[i3];
      const baseY = positions[i3 + 1];
      const baseZ = positions[i3 + 2];

      // Breathing expansion/contraction
      const breathScale = 1 + breathPhase * 0.15;

      // Scroll-driven drift
      const scrollDrift = scroll * 2.0;

      posArray[i3] = baseX * breathScale + Math.sin(angle) * 0.3 * ry;
      posArray[i3 + 1] = baseY * breathScale + Math.cos(angle * 0.7) * 0.2 * rz - scrollDrift;
      posArray[i3 + 2] = baseZ * breathScale + Math.sin(angle * 1.3) * 0.2 * rx;
    }

    geo.attributes.position.needsUpdate = true;

    // Pulsing opacity
    meshRef.current.material.opacity = 0.35 + breathPhase * 0.2;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.025}
        color="#D4C4B0"
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
