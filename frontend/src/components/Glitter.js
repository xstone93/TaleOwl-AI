// src/components/Glitter.js
'use client';

import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Glitter = () => {
  const points = useRef();

  useEffect(() => {
    const vertices = [];
    const numPoints = 2000;

    for (let i = 0; i < numPoints; i++) {
      const x = THREE.MathUtils.randFloatSpread(400); // Random position within a 200 unit cube
      const y = THREE.MathUtils.randFloatSpread(100);
      const z = THREE.MathUtils.randFloatSpread(430);

      vertices.push(x, y, z);
    }

    points.current.geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(vertices, 3)
    );
  }, []);

  useFrame(() => {
    points.current.rotation.y += 0.001; // Slow rotation for effect
  });

  return (
    <points ref={points}>
      <bufferGeometry />
      <pointsMaterial
        size={1}
        color="silver"
        transparent={true}
        opacity={0.8}
        sizeAttenuation={true}
      />
    </points>
  );
};

export default Glitter;
