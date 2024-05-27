// components/AvatarScene.js
'use client';

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Cloud, Clouds } from '@react-three/drei';
import Avatar from './Avatar';
import Forest from './Forest'; 
import Glitter from './Glitter';


const AvatarScene = () => {
  return (
    <Canvas
      style={canvasStyle}
      camera={{ position: [0, 5, 12], fov: 85 }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[15, 10, 5]} intensity={1} />
      <OrbitControls
        enableZoom={true}
        minDistance={400}
        maxDistance={500}
        maxPolarAngle={Math.PI / 2}
        minAzimuthAngle={-Math.PI / 4} // Limit left rotation to -45 degrees
        maxAzimuthAngle={Math.PI / 4}  // Limit right rotation to 45 degrees
      />
      <Sky
        distance={450000} // Camera distance (default=450000)
        sunPosition={[10, 1, 55]} // Sun position in the sky
        inclination={0.5} // Sun elevation angle from 0 to 1 (default=0)
        azimuth={0.25} // Sun rotation around the Y axis from 0 to 1 (default=0.25)
        turbidity={8} // Sky turbidity (default=10)
        rayleigh={2} // Sky rayleigh scattering (default=2)
        mieCoefficient={0.005} // Sky mie coefficient (default=0.005)
        mieDirectionalG={0.8} // Sky mie directional g (default=0.8)
      />
      <Forest /> {/* Add the Forest component */}
      <Avatar /> {/* Add the Avatar component */}
      <Glitter /> {/* Add the Glitter component */}
    </Canvas>
  );
};

const canvasStyle = {
  width: '100%',
  height: '100%',
};

export default AvatarScene;
