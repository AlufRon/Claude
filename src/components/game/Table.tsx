'use client'
import { RigidBody } from '@react-three/rapier'
import { MeshStandardMaterial } from 'three'

export default function Table() {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <TableSurface />
      <TableLegs />
      <Net />
      <TableLines />
    </RigidBody>
  )
}

function TableSurface() {
  return (
    <mesh receiveShadow castShadow position={[0, 0, 0]}>
      <boxGeometry args={[2.74, 0.05, 1.525]} />
      <meshStandardMaterial 
        color="#1a472a"
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  )
}

function TableLegs() {
  const legGeometry = [0.1, 0.76, 0.1]
  const positions = [
    [-1.27, -0.38, 0.7],
    [-1.27, -0.38, -0.7],
    [1.27, -0.38, 0.7],
    [1.27, -0.38, -0.7]
  ]

  return (
    <>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <boxGeometry args={legGeometry} />
          <meshStandardMaterial 
            color="#1a1a1a"
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
      ))}
    </>
  )
}

function Net() {
  return (
    <mesh position={[0, 0.1, 0]} castShadow>
      <boxGeometry args={[0.02, 0.15, 1.525]} />
      <meshStandardMaterial 
        color="white"
        opacity={0.9}
        transparent
        roughness={0.5}
        metalness={0.1}
      />
    </mesh>
  )
}

function TableLines() {
  return (
    <>
      {/* Center line */}
      <mesh position={[0, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.02, 1.525]} />
        <meshStandardMaterial color="white" />
      </mesh>
      {/* Border lines */}
      <mesh position={[0, 0.026, 0.7625]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.74, 0.02]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0, 0.026, -0.7625]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.74, 0.02]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </>
  )
}