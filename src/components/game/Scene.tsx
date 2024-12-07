'use client'
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { 
  Environment, 
  OrbitControls, 
  PerspectiveCamera, 
  Stars,
  KeyboardControls
} from '@react-three/drei'
import { 
  EffectComposer, 
  Bloom, 
  ChromaticAberration, 
  DepthOfField,
  Vignette
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { Physics } from '@react-three/rapier'
import { Ground, RoomLights, Walls } from './Environment'
import Table from './Table'
import Ball from './Ball'
import Paddle from './Paddle'
import { useGameStore } from '@/store/gameStore'

export default function Scene() {
  const { isPlaying, isPaused } = useGameStore()

  return (
    <Canvas shadows>
      <PerspectiveCamera
        makeDefault
        position={[4, 4, 4]}
        fov={60}
        near={0.1}
        far={100}
      />
      
      <color attach="background" args={["#000000"]} />
      <fogExp2 attach="fog" color="#000000" density={0.02} />
      
      <Suspense fallback={null}>
        <Stars 
          radius={50}
          depth={50}
          count={1000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        
        <Environment preset="night" />
        <RoomLights />
        
        <Physics 
          debug={false}
          gravity={[0, -9.81, 0]}
          paused={!isPlaying || isPaused}
        >
          <Ground />
          <Walls />
          <Table />
          <Ball />
          <Paddle position={[-1, 0.1, 0]} color="#ff4040" playerId={1} />
          <Paddle position={[1, 0.1, 0]} color="#4040ff" playerId={2} />
        </Physics>
        
        <EffectComposer>
          <Bloom 
            intensity={1.5}
            luminanceThreshold={0.6}
            luminanceSmoothing={0.9}
          />
          <ChromaticAberration
            blendFunction={BlendFunction.NORMAL}
            offset={[0.002, 0.002]}
          />
          <DepthOfField
            focusDistance={0}
            focalLength={0.02}
            bokehScale={2}
            height={480}
          />
          <Vignette
            opacity={0.3}
            darkness={0.8}
          />
        </EffectComposer>
        
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
      </Suspense>
    </Canvas>
  )
}