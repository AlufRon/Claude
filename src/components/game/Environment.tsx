'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

export function Ground() {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial 
        color="#303030"
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  )
}

export function RoomLights() {
  const lightRef = useRef()
  
  useFrame(({clock}) => {
    if (lightRef.current) {
      lightRef.current.position.x = Math.sin(clock.getElapsedTime() * 0.5) * 8
      lightRef.current.position.z = Math.cos(clock.getElapsedTime() * 0.5) * 8
    }
  })

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight
        ref={lightRef}
        position={[5, 5, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={0.5} />
    </>
  )
}

export function Walls() {
  return (
    <>
      {/* Back wall */}
      <mesh position={[0, 5, -15]} receiveShadow>
        <boxGeometry args={[30, 20, 0.2]} />
        <meshStandardMaterial color="#404040" />
      </mesh>
      {/* Left wall */}
      <mesh position={[-15, 5, 0]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[30, 20, 0.2]} />
        <meshStandardMaterial color="#404040" />
      </mesh>
      {/* Right wall */}
      <mesh position={[15, 5, 0]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <boxGeometry args={[30, 20, 0.2]} />
        <meshStandardMaterial color="#404040" />
      </mesh>
    </>
  )
}
