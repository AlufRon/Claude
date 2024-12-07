'use client'
import { useRef } from 'react'

const FLOOR_COLOR = '#2A2A2A'
const WALL_COLOR = '#3A3A3A'

export function Room() {
  return (
    <group>
      {/* Floor */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          color={FLOOR_COLOR}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Walls */}
      <mesh receiveShadow position={[0, 3, -10]}>
        <boxGeometry args={[20, 10, 0.2]} />
        <meshStandardMaterial 
          color={WALL_COLOR}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>
      
      <mesh receiveShadow position={[-10, 3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[20, 10, 0.2]} />
        <meshStandardMaterial 
          color={WALL_COLOR}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>
      
      <mesh receiveShadow position={[10, 3, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <boxGeometry args={[20, 10, 0.2]} />
        <meshStandardMaterial 
          color={WALL_COLOR}
          roughness={0.7}
          metalness={0.3}
        />
      </mesh>

      {/* Ceiling */}
      <mesh receiveShadow position={[0, 8, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          color={FLOOR_COLOR}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Spotlights */}
      <SpotLight position={[-2, 7, 0]} />
      <SpotLight position={[2, 7, 0]} />
    </group>
  )
}

function SpotLight({ position }: { position: [number, number, number] }) {
  const lightRef = useRef()

  return (
    <group position={position}>
      {/* Light fixture */}
      <mesh castShadow>
        <cylinderGeometry args={[0.2, 0.3, 0.3, 32]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      
      {/* Actual light */}
      <spotLight
        ref={lightRef}
        intensity={1}
        angle={0.5}
        penumbra={0.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        position={[0, 0, 0]}
        target-position={[0, -1, 0]}
      />
    </group>
  )
}