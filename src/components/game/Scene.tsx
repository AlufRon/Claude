'use client'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Physics } from '@react-three/rapier'
import Table from './Table'
import Ball from './Ball'
import Paddle from './Paddle'

export default function Scene() {
  return (
    <Canvas 
      shadows 
      camera={{ 
        position: [3, 3, 3], 
        fov: 75,
        near: 0.1,
        far: 1000
      }}
    >
      <color attach="background" args={["#1c1c1c"]} />
      <Environment preset="sunset" />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <Physics debug>
        <Table />
        <Ball />
        <Paddle position={[-1, 0.1, 0]} color="red" />
        <Paddle position={[1, 0.1, 0]} color="blue" />
      </Physics>
      <OrbitControls 
        enablePan={false}
        minDistance={3}
        maxDistance={10}
      />
      <EffectComposer>
        <Bloom luminanceThreshold={1} intensity={2} />
      </EffectComposer>
    </Canvas>
  )
}