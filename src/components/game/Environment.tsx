'use client'
import { useRef } from 'react'

function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {/* Trunk */}
      <mesh castShadow receiveShadow position={[0, 1, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 2]} />
        <meshStandardMaterial color="#3e2723" roughness={0.8} />
      </mesh>
      {/* Leaves layers */}
      <mesh castShadow receiveShadow position={[0, 2.5, 0]}>
        <coneGeometry args={[1.5, 3, 8]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.8} />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 3.5, 0]}>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial color="#388e3c" roughness={0.8} />
      </mesh>
    </group>
  )
}

function StaticGrassPatch({ position, rotation, scale }) {
  return (
    <mesh 
      position={position}
      rotation={rotation}
      scale={scale}
      receiveShadow
    >
      <boxGeometry args={[1, 0.2, 1]} />
      <meshStandardMaterial 
        color="#3f8f36"
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  )
}

function Ground() {
  const patches = []
  for (let x = -30; x <= 30; x += 2) {
    for (let z = -30; z <= 30; z += 2) {
      const position = [x + Math.random() * 0.5, -2, z + Math.random() * 0.5]
      const rotation = [0, Math.random() * Math.PI * 0.1, 0]
      const scale = [1 + Math.random() * 0.2, 1, 1 + Math.random() * 0.2]
      patches.push(
        <StaticGrassPatch
          key={`${x}-${z}`}
          position={position}
          rotation={rotation}
          scale={scale}
        />
      )
    }
  }
  return (
    <group>
      {/* Base ground */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#2d5a27" roughness={1} metalness={0} />
      </mesh>
      {/* Grass patches */}
      {patches}
    </group>
  )
}

export function Room() {
  return (
    <group>
      {/* Main directional light (sun) */}
      <directionalLight
        castShadow
        position={[15, 20, 15]}
        intensity={1.5}
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={30}
        shadow-camera-bottom={-30}
        shadow-camera-near={1}
        shadow-camera-far={100}
      />
      
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.3} />
      
      {/* Hemisphere light for natural sky lighting */}
      <hemisphereLight
        args={["#85b5e1", "#71a861", 1]}
        position={[0, 50, 0]}
        intensity={0.5}
      />

      {/* Ground and grass */}
      <Ground />

      {/* Trees */}
      <Tree position={[-8, 0, -8]} scale={2} />
      <Tree position={[10, 0, -12]} scale={1.7} />
      <Tree position={[-12, 0, -15]} scale={2.2} />
      <Tree position={[15, 0, -10]} scale={1.8} />
      <Tree position={[-6, 0, -20]} scale={2.5} />
    </group>
  )
}