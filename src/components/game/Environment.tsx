'use client'
import { useRef } from 'react'
import * as THREE from 'three'

// Ground textures and colors
const GRASS_COLORS = [
  '#2d5a27',  // Dark green
  '#3f8f36',  // Medium green
  '#4caf50',  // Light green
  '#388e3c',  // Forest green
  '#1b5e20'   // Deep green
]

function DetailedTree({ position, scale = 1 }) {
  const trunkColor = new THREE.Color('#3e2723').multiplyScalar(0.8 + Math.random() * 0.4)
  const leavesColor = new THREE.Color('#2e7d32').multiplyScalar(0.8 + Math.random() * 0.4)
  const rotation = [0, Math.random() * Math.PI * 2, 0]

  return (
    <group position={position} scale={scale} rotation={rotation}>
      {/* Main trunk */}
      <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 3]} />
        <meshStandardMaterial 
          color={trunkColor}
          roughness={0.9}
          metalness={0}
          bumpScale={0.5}
        />
      </mesh>
      
      {/* Branches */}
      {[...Array(5)].map((_, i) => {
        const angle = (i / 5) * Math.PI * 2
        const branchPos = [
          Math.cos(angle) * 0.3,
          2 + Math.random(),
          Math.sin(angle) * 0.3
        ]
        return (
          <mesh key={i} castShadow position={branchPos} rotation={[Math.random() * 0.5, angle, Math.PI * 0.2]}>
            <cylinderGeometry args={[0.05, 0.08, 1]} />
            <meshStandardMaterial color={trunkColor} roughness={0.9} />
          </mesh>
        )
      })}

      {/* Leaf clusters */}
      {[...Array(3)].map((_, i) => (
        <group key={i} position={[0, 2.5 + i, 0]}>
          <mesh castShadow receiveShadow>
            <sphereGeometry args={[1.2 - i * 0.2, 8, 8]} />
            <meshStandardMaterial 
              color={leavesColor}
              roughness={0.8}
              metalness={0.1}
              transparent
              opacity={0.95}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function TerrainPatch({ position, rotation, scale }) {
  const color = GRASS_COLORS[Math.floor(Math.random() * GRASS_COLORS.length)]
  const heightScale = 0.1 + Math.random() * 0.2

  return (
    <mesh 
      position={position}
      rotation={rotation}
      scale={[scale[0], heightScale, scale[2]]}
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial 
        color={color}
        roughness={0.8 + Math.random() * 0.2}
        metalness={0}
      />
    </mesh>
  )
}

function Ground() {
  // Create terrain patches with slight elevation changes
  const patches = []
  for (let x = -30; x <= 30; x += 2) {
    for (let z = -30; z <= 30; z += 2) {
      // Skip area around ping pong table
      if (Math.abs(x) < 4 && Math.abs(z) < 3) continue

      const heightOffset = Math.sin(x * 0.1) * Math.cos(z * 0.1) * 0.5
      const position = [x, -2 + heightOffset, z]
      const rotation = [
        Math.random() * 0.1,
        Math.random() * Math.PI * 0.1,
        Math.random() * 0.1
      ]
      const scale = [2 + Math.random() * 0.5, 1, 2 + Math.random() * 0.5]
      
      patches.push(
        <TerrainPatch
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
        <planeGeometry args={[100, 100, 50, 50]} />
        <meshStandardMaterial 
          color={GRASS_COLORS[0]}
          roughness={1}
          metalness={0}
          wireframe={false}
        />
      </mesh>
      {/* Terrain patches */}
      {patches}
    </group>
  )
}

export function Room() {
  const sunRef = useRef()
  const sunPosition = [30, 50, 30]

  return (
    <group>
      {/* Main sun light */}
      <directionalLight
        ref={sunRef}
        castShadow
        position={sunPosition}
        intensity={2}
        shadow-mapSize={[4096, 4096]}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-camera-near={1}
        shadow-camera-far={100}
        color="#ffd700"
      />
      
      {/* Ambient light */}
      <ambientLight intensity={0.3} color="#b0c4de" />
      
      {/* Hemisphere light */}
      <hemisphereLight
        args={["#87ceeb", "#3f8f36", 1]}
        position={[0, 50, 0]}
        intensity={0.5}
      />

      {/* Ground with terrain */}
      <Ground />

      {/* Detailed trees scattered around */}
      {[...Array(15)].map((_, i) => {
        const angle = (i / 15) * Math.PI * 2
        const radius = 15 + Math.random() * 10
        const position = [
          Math.cos(angle) * radius,
          0,
          Math.sin(angle) * radius
        ]
        return (
          <DetailedTree 
            key={i}
            position={position}
            scale={1.5 + Math.random()}
          />
        )
      })}
    </group>
  )
}