'use client'
import { useRef } from 'react'
import * as THREE from 'three'
import { Rock, Flower, TableProps } from './Props'

function DetailedTree({ position, scale = 1 }) {
  const rotation = [0, Math.random() * Math.PI * 2, 0]
  return (
    <group position={position} scale={scale} rotation={rotation}>
      {/* Main trunk */}
      <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 3]} />
        <meshStandardMaterial color="#3e2723" roughness={0.9} />
      </mesh>
      {/* Leaves */}
      <mesh castShadow receiveShadow position={[0, 3.5, 0]}>
        <coneGeometry args={[1.5, 3, 8]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.8} />
      </mesh>
    </group>
  )
}

function Ground() {
  return (
    <group>
      {/* Base ground */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#2d5a27" roughness={1} />
      </mesh>
      {/* Grass patches */}
      {[...Array(100)].map((_, i) => {
        const x = Math.random() * 80 - 40
        const z = Math.random() * 80 - 40
        return (
          <mesh 
            key={i}
            position={[x, -1.9, z]}
            rotation={[0, Math.random() * Math.PI, 0]}
            receiveShadow
          >
            <boxGeometry args={[0.2, 0.1, 0.2]} />
            <meshStandardMaterial color={`#${Math.floor(Math.random() * 0x334428 + 0x2d5a27).toString(16)}`} />
          </mesh>
        )
      })}
    </group>
  )
}

export function Environment() {  // Changed from Room to Environment
  const sunRef = useRef()

  return (
    <group>
      {/* Main sun light */}
      <directionalLight
        ref={sunRef}
        castShadow
        position={[15, 20, 15]}
        intensity={1.5}
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
      />
      
      {/* Ambient light */}
      <ambientLight intensity={0.3} />
      
      {/* Hemisphere light */}
      <hemisphereLight
        args={["#87ceeb", "#2d5a27", 1]}
        position={[0, 50, 0]}
        intensity={0.5}
      />

      <Ground />

      {/* Trees */}
      {[...Array(10)].map((_, i) => {
        const angle = (i / 10) * Math.PI * 2
        const radius = 15 + Math.random() * 10
        return (
          <DetailedTree 
            key={i}
            position={[
              Math.cos(angle) * radius,
              0,
              Math.sin(angle) * radius
            ]}
            scale={1.5 + Math.random()}
          />
        )
      })}

      {/* Props */}
      <Rock position={[5, -1.8, 5]} scale={1} />
      <Rock position={[-6, -1.8, -4]} scale={0.7} />
      <Flower position={[4, -1.9, -3]} />
      <TableProps />
    </group>
  )
}
