'use client'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
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
        camera={{ position: [8, 8, 8], fov: 50 }}
        gl={{
          antialias: true,
          alpha: false,
          physicallyCorrectLights: true,
          shadowMap: {
            enabled: true,
            type: 3 // VSMShadowMap
          }
        }}
      >
        <color attach="background" args={["#87ceeb"]} /> {/* Sky blue */}
        
        {/* Environment map for reflections */}
        <Environment preset="sunset" ground={{ height: 5, radius: 40 }} />
        
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

        <OrbitControls
          enablePan={false}
          minDistance={5}
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