'use client'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Physics } from '@react-three/rapier'
import Table from './Table'
import Ball from './Ball'
import Paddle from './Paddle'

export default function Scene() {
  return (
    <Canvas shadows camera={{ position: [4, 4, 4], fov: 50 }}>
      <Environment preset="sunset" />
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <Physics>
        <Table />
        <Ball />
        <Paddle position={[-1, 0.1, 0]} color="red" />
        <Paddle position={[1, 0.1, 0]} color="blue" />
      </Physics>
      <EffectComposer>
        <Bloom luminanceThreshold={1} intensity={2} />
      </EffectComposer>
    </Canvas>
  )
}