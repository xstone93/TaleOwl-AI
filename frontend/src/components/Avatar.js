// components/Avatar.js
'use client';

import React, { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const Avatar = () => {
  const gltf = useGLTF('/models/snow_owl.glb');
  const mixer = useRef(null);

  useEffect(() => {
    console.log('gltf', gltf); // Debugging: Check the gltf content

    if (gltf.animations.length && gltf.scene) {
      mixer.current = new THREE.AnimationMixer(gltf.scene);
      gltf.animations.forEach((clip) => {
        mixer.current?.clipAction(clip).play();
      });

      return () => {
        if (mixer.current) {
          mixer.current.stopAllAction();
          mixer.current = null;
        }
      }
    }

    return () => {
      if (mixer.current) {
        mixer.current.stopAllAction();
        mixer.current = null;
      }
    };
  }, [gltf]);

  useFrame((_, delta) => {
    if (mixer.current) {
      mixer.current.update(delta);
    }
  });

  return (
    <primitive
      object={gltf.scene}
      scale={[60, 60, 60]}
      position={[45, 140, 150]} // Adjust position as needed
      rotation={[0, 320, 0]} // Adjust rotation as needed (e.g., 90 degrees around the Y axis)
    />
  );
};

export default Avatar;
