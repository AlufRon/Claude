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
          antialias: false,
          powerPreference: 'high-performance',
        }}
      >
        <color attach="background" args={["#87ceeb"]} /> {/* Sky blue background */}
        
        {/* Environment for better lighting */}
        <Environment preset="sunset" background blur={0.6} />
        
        <Room />
        
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

        <EffectComposer multisampling={0}>
          <SMAA />
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.9}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>

        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={20}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.5}
          target={[0, 0, 0]}
          enableDamping
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  )
}