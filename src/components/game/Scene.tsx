'use client'
import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
  Stars,
  Grid,
  AccumulativeShadows,
  RandomizedLight,
  SoftShadows
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
    <Canvas 
      shadows 
      camera={{ position: [4, 4, 4], fov: 60 }}
      style={{ height: '100%', width: '100%' }}
      gl={{ 
        antialias: true,
        alpha: false,
        stencil: false,
        powerPreference: 'high-performance'
      }}
    >
      <SoftShadows size={40} samples={16} />
      
      <color attach="background" args={["#000000"]} />
      <fogExp2 attach="fog" color="#000000" density={0.02} />
      
      <Suspense fallback={null}>
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        <Environment
          preset="night"
          background
          blur={0.8}
        />

        <AccumulativeShadows
          temporal
          frames={100}
          alphaTest={0.85}
          opacity={0.8}
          scale={20}
          position={[0, -0.5, 0]}
        >
          <RandomizedLight
            amount={8}
            radius={10}
            ambient={0.5}
            intensity={1}
            position={[5, 5, -10]}
            bias={0.001}
          />
        </AccumulativeShadows>

        <Grid
          renderOrder={-1}
          position={[0, -1, 0]}
          infiniteGrid
          cellSize={0.6}
          cellThickness={0.6}
          sectionSize={3.3}
          sectionThickness={1}
          sectionColor={[0.5, 0.5, 1]}
          fadeDistance={30}
          fadeStrength={1}
          followCamera={false}
        />

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

        <EffectComposer multisampling={4}>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.6}
            luminanceSmoothing={0.9}
            mipmapBlur
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
            offset={0.5}
            darkness={0.5}
            opacity={0.3}
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