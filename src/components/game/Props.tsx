'use client'
import { useRef } from 'react'
import * as THREE from 'three'

export function Rock({ position, scale = 1 }) {
  const rotation = [0, Math.random() * Math.PI * 2, 0]
  
  return (
    <mesh 
      position={position}
      rotation={rotation}
      scale={scale}
      castShadow
      receiveShadow
    >
      <dodecahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color={`#${Math.floor(Math.random() * 0x444444 + 0x666666).toString(16)}`}
        roughness={0.8}
        metalness={0.2}
      />
    </mesh>
  )
}

export function Flower({ position }) {
  const colors = ['#ff69b4', '#ff1493', '#ff69b4', '#ffb6c1', '#ffc0cb']
  const color = colors[Math.floor(Math.random() * colors.length)]
  const rotation = [0, Math.random() * Math.PI * 2, 0]

  return (
    <group position={position} rotation={rotation}>
      {/* Stem */}
      <mesh castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.3]} />
        <meshStandardMaterial color="#228b22" />
      </mesh>
      
      {/* Petals */}
      {[...Array(5)].map((_, i) => {
        const angle = (i / 5) * Math.PI * 2
        const petalPos = [
          Math.cos(angle) * 0.1,
          0.2,
          Math.sin(angle) * 0.1
        ]
        return (
          <mesh key={i} position={petalPos} rotation={[Math.PI/4, angle, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial 
              color={color}
              emissive={color}
              emissiveIntensity={0.2}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export function TableProps() {
  return (
    <group>
      {/* Water bottle */}
      <mesh position={[2, 0, 1]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.3]} />
        <meshStandardMaterial 
          color="#b3e0ff"
          transparent
          opacity={0.6}
          metalness={0.9}
          roughness={0}
        />
      </mesh>

      {/* Score board */}
      <mesh position={[0, 0.5, -1]} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.4, 0.3, 0.05]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>

      {/* Spare balls */}
      {[...Array(3)].map((_, i) => (
        <mesh key={i} position={[1.8 + i * 0.1, 0, -0.8]} castShadow>
          <sphereGeometry args={[0.02, 32, 32]} />
          <meshStandardMaterial color="white" />
        </mesh>
      ))}
    </group>
  )
}
