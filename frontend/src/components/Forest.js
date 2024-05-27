// components/Forest.js
import React from 'react';
import { useGLTF } from '@react-three/drei';

const Forest = () => {
  const { scene } = useGLTF('/models/library.glb'); // Replace with your forest model path
  return <primitive object={scene} scale={[0.30, 0.30, 0.30]} rotation={[0, 5.5, 0]} position={[0, -1, 0]} />;
};

export default Forest;
