'use client'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls, Stars } from '@react-three/drei'
import { EffectComposer, Bloom, SMAA } from '@react-three/postprocessing'
import { Physics } from '@react-three/rapier'
import { Room } from './Environment'
import Table from './Table'
import Ball from './Ball'
import Paddle from './Paddle'
import { useGameStore } from '@/store/gameStore'

export default function Scene() {
  const { isPlaying, isPaused } = useGameStore()

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        shadows
        camera={{ position: [4, 4, 4], fov: 50 }}
        gl={{
          antialias: false, // We'll use SMAA instead
          powerPreference: 'high-performance',
        }}
      >
        <color attach="background" args={["#000000"]} />
        
        {/* Main ambient light */}
        <ambientLight intensity={0.2} />
        
        {/* Environment maps for reflections */}
        <Environment preset="apartment" background blur={1} />
        
        {/* Room with spotlights */}
        <Room />
        
        <Stars
          radius={100}
          depth={50}
          count={1000}
          factor={4}
          saturation={0}
          fade
        />

        <Physics
          debug={false}
          gravity={[0, -9.81, 0]}
          paused={!isPlaying || isPaused}
        >
          <Table />
          <Ball />
          <Paddle position={[-1, 0.3, 0]} color="#ff4040" playerId={1} />
          <Paddle position={[1, 0.3, 0]} color="#4040ff" playerId={2} />
        </Physics>

        {/* Post processing */}
        <EffectComposer multisampling={0}>
          <SMAA /> {/* Better anti-aliasing */}
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.9}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>

        {/* Camera controls */}
        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={10}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
          target={[0, 0, 0]}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  )
}