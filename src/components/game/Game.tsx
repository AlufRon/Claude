'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import Table from './Table'
import Paddle from './Paddle'
import Ball from './Ball'
import { Physics } from '@react-three/rapier'

export default function Game() {
  return (
    <div className="w-full h-[600px] relative">
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
          <Paddle position={[-1, 0.1, 0]} color="red" />
          <Paddle position={[1, 0.1, 0]} color="blue" />
          <Ball />
        </Physics>
        <OrbitControls />
      </Canvas>
    </div>
  )
}