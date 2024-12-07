'use client'
import { Canvas } from '@react-three/fiber'
import { Environment, OrbitControls, Fog } from '@react-three/drei'
import { EffectComposer, Bloom, SMAA, HueSaturation } from '@react-three/postprocessing'
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
          antialias: false,
          alpha: false,
          physicallyCorrectLights: true,
          shadowMap: {
            enabled: true,
            type: 3 // VSMShadowMap for better shadows
          },
        }}
      >
        <color attach="background" args={["#87ceeb"]} />
        
        {/* High quality environment map */}
        <Environment
          preset="sunset"
          ground={{
            height: 15,
            radius: 60,
            scale: 15
          }}
        />

        {/* Scene fog for depth */}
        <Fog color="#b0c4de" near={1} far={100} />
        
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

        {/* Post processing effects */}
        <EffectComposer multisampling={0}>
          <SMAA />
          <Bloom
            intensity={0.5}
            luminanceThreshold={0.8}
            luminanceSmoothing={0.9}
          />
          <HueSaturation
            hue={0} // slightly adjust color
            saturation={0.15} // increase saturation
          />
        </EffectComposer>

        <OrbitControls
          enablePan={false}
          minDistance={5}
          maxDistance={25}
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