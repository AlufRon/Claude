'use client'
import { useRef } from 'react'

function Ground() {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#2d5a27" roughness={1} />
    </mesh>
  )
}

const Tree = ({ position, scale = 1 }) => {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh castShadow position={[0, 1, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 2]} />
        <meshStandardMaterial color="#3e2723" roughness={0.9} />
      </mesh>
      {/* Leaves */}
      <mesh castShadow position={[0, 2.5, 0]}>
        <coneGeometry args={[1.5, 3, 8]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.8} />
      </mesh>
    </group>
  )
}

export default function Environment() {
  return (
    <group>
      <Ground />
      
      {/* Trees */}
      {[...Array(10)].map((_, i) => {
        const angle = (i / 10) * Math.PI * 2
        const radius = 15 + Math.random() * 10
        return (
          <Tree 
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
    </group>
  )
}