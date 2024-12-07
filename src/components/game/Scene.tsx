'use client'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls, Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { Physics } from '@react-three/rapier'
import { Ground, RoomLights, Walls } from './Environment'
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
        camera={{ position: [4, 4, 4], fov: 60 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        <color attach="background" args={["#000000"]} />
        
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
        />

        <Environment preset="night" />

        <Physics
          debug={false}
          gravity={[0, -9.81, 0]}
          paused={!isPlaying || isPaused}
        >
          <Ground />
          <Walls />
          <Table />
          <Ball />
          <Paddle position={[-1, 0.3, 0]} color="#ff4040" playerId={1} />
          <Paddle position={[1, 0.3, 0]} color="#4040ff" playerId={2} />
        </Physics>

        <EffectComposer disableNormalPass>
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.9}
            luminanceSmoothing={0.9}
          />
        </EffectComposer>

        <OrbitControls
          enablePan={false}
          minDistance={3}
          maxDistance={10}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  )
}