'use client'
import { useRef } from 'react'

function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh castShadow position={[0, 1, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 2]} />
        <meshStandardMaterial color="#3e2723" roughness={0.8} />
      </mesh>
      {/* Leaves layers */}
      <mesh castShadow position={[0, 2.5, 0]}>
        <coneGeometry args={[1.5, 3, 8]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 3.5, 0]}>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial color="#388e3c" roughness={0.8} />
      </mesh>
    </group>
  )
}

function Sun() {
  return (
    <group position={[50, 40, -60]}>
      {/* Sun disk */}
      <mesh>
        <sphereGeometry args={[10]} />
        <meshStandardMaterial
          color="#fdd835"
          emissive="#fdd835"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
      {/* Sun light */}
      <directionalLight
        intensity={3}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
    </group>
  )
}

function Grass() {
  // Create a grid of grass patches
  const grassPatches = []
  for (let x = -15; x <= 15; x += 2) {
    for (let z = -15; z <= 15; z += 2) {
      grassPatches.push(
        <mesh 
          key={`${x}-${z}`} 
          position={[x + Math.random(), -1.99, z + Math.random()]}
          rotation={[0, Math.random() * Math.PI, 0]}
        >
          <boxGeometry args={[0.2, 0.1, 0.2]} />
          <meshStandardMaterial color={`hsl(${120 + Math.random() * 20}, 70%, ${30 + Math.random() * 20}%)`} />
        </mesh>
      )
    }
  }
  return <group>{grassPatches}</group>
}

export function Room() {
  return (
    <group>
      {/* Ground with grass */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#4caf50" roughness={0.8} />
      </mesh>
      <Grass />

      {/* Trees */}
      <Tree position={[-8, 0, -8]} scale={2} />
      <Tree position={[10, 0, -12]} scale={1.7} />
      <Tree position={[-12, 0, -15]} scale={2.2} />
      <Tree position={[15, 0, -10]} scale={1.8} />
      <Tree position={[-6, 0, -20]} scale={2.5} />

      {/* Sun */}
      <Sun />

      {/* Fog for depth */}
      <fog attach="fog" args={["#90caf9", 30, 100]} />

      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.5} />
    </group>
  )
}