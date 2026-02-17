/**
 * ShoeModel
 * 
 * A procedural shoe-like 3D model using Three.js geometry.
 * Uses MeshPhysicalMaterial to mimic soft, porous vegan leather.
 * 
 * When a real GLTF model is available, replace the geometry below
 * with: const { scene } = useGLTF('/models/shoe.glb')
 */
'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * Creates a shoe-like shape from merged geometries.
 */
function createShoeGeometry() {
  const group = new THREE.Group();

  // --- Sole ---
  const soleShape = new THREE.Shape();
  soleShape.moveTo(-0.6, -1.2);
  soleShape.quadraticCurveTo(-0.8, -0.6, -0.7, 0.0);
  soleShape.quadraticCurveTo(-0.65, 0.5, -0.5, 0.9);
  soleShape.quadraticCurveTo(-0.3, 1.2, 0.0, 1.3);
  soleShape.quadraticCurveTo(0.3, 1.2, 0.5, 0.9);
  soleShape.quadraticCurveTo(0.65, 0.5, 0.7, 0.0);
  soleShape.quadraticCurveTo(0.8, -0.6, 0.6, -1.2);
  soleShape.quadraticCurveTo(0.0, -1.4, -0.6, -1.2);

  const soleExtrudeSettings = {
    steps: 2,
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.03,
    bevelSegments: 3,
  };

  const soleGeo = new THREE.ExtrudeGeometry(soleShape, soleExtrudeSettings);
  soleGeo.rotateX(-Math.PI / 2);
  soleGeo.translate(0, -0.25, 0.05);

  // --- Upper (shoe body) ---
  const upperGeo = new THREE.SphereGeometry(0.7, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.55);
  upperGeo.scale(0.85, 0.65, 1.3);
  upperGeo.translate(0, 0.1, -0.1);

  // --- Toe cap ---
  const toeGeo = new THREE.SphereGeometry(0.45, 24, 16, 0, Math.PI * 2, Math.PI * 0.2, Math.PI * 0.35);
  toeGeo.scale(0.9, 0.55, 0.8);
  toeGeo.translate(0, -0.05, 0.85);

  // --- Heel counter ---
  const heelGeo = new THREE.CylinderGeometry(0.35, 0.4, 0.3, 16, 1, true, -Math.PI * 0.6, Math.PI * 1.2);
  heelGeo.translate(0, 0.15, -0.85);

  return { soleGeo, upperGeo, toeGeo, heelGeo };
}

export default function ShoeModel({
  rotationSpeed = 0.2,
  mouseX = 0,
  mouseY = 0,
  explodeProgress = 0,
  color = '#8B7355',
  soleColor = '#3D2F28',
}) {
  const groupRef = useRef();
  const soleRef = useRef();
  const upperRef = useRef();
  const toeRef = useRef();
  const heelRef = useRef();

  const geometries = useMemo(() => createShoeGeometry(), []);

  // Vegan leather material — soft, porous appearance
  const leatherMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(color),
        roughness: 0.75,
        metalness: 0.02,
        clearcoat: 0.1,
        clearcoatRoughness: 0.6,
        sheen: 0.4,
        sheenRoughness: 0.5,
        sheenColor: new THREE.Color('#D4C4B0'),
        envMapIntensity: 0.8,
        side: THREE.DoubleSide,
      }),
    [color]
  );

  const soleMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(soleColor),
        roughness: 0.9,
        metalness: 0.0,
        clearcoat: 0.05,
        side: THREE.DoubleSide,
      }),
    [soleColor]
  );

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Slow rotation
    groupRef.current.rotation.y += delta * rotationSpeed;

    // Mouse parallax tilt
    const targetRotX = mouseY * 0.15;
    const targetRotZ = mouseX * -0.08;
    groupRef.current.rotation.x += (targetRotX - groupRef.current.rotation.x) * 0.05;
    groupRef.current.rotation.z += (targetRotZ - groupRef.current.rotation.z) * 0.05;

    // Levitation bob
    const time = state.clock.getElapsedTime();
    groupRef.current.position.y = Math.sin(time * 0.6) * 0.08;

    // Explode animation — separate layers
    if (soleRef.current && upperRef.current && toeRef.current && heelRef.current) {
      const ep = explodeProgress;
      soleRef.current.position.y = -0.25 - ep * 1.2;
      upperRef.current.position.y = 0.1 + ep * 0.6;
      toeRef.current.position.z = 0.85 + ep * 0.8;
      heelRef.current.position.z = -0.85 - ep * 0.8;
    }
  });

  return (
    <group ref={groupRef} scale={1.2}>
      {/* Sole */}
      <mesh ref={soleRef} geometry={geometries.soleGeo} material={soleMaterial} castShadow />
      {/* Upper */}
      <mesh ref={upperRef} geometry={geometries.upperGeo} material={leatherMaterial} castShadow />
      {/* Toe */}
      <mesh ref={toeRef} geometry={geometries.toeGeo} material={leatherMaterial} castShadow />
      {/* Heel */}
      <mesh ref={heelRef} geometry={geometries.heelGeo} material={leatherMaterial} castShadow />
    </group>
  );
}
