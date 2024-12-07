'use client'
import { RigidBody, CuboidCollider } from '@react-three/rapier'

export default function Table() {
  return (
    <RigidBody type="fixed" colliders={false}>
      {/* Table colliders */}
      <CuboidCollider args={[1.37, 0.1, 0.76]} position={[0, -0.1, 0]} restitution={0.8} /> {/* Main surface */}
      <CuboidCollider args={[0.1, 0.1, 0.76]} position={[1.37, -0.1, 0]} /> {/* Right edge */}
      <CuboidCollider args={[0.1, 0.1, 0.76]} position={[-1.37, -0.1, 0]} /> {/* Left edge */}
      <CuboidCollider args={[1.37, 0.1, 0.1]} position={[0, -0.1, 0.76]} /> {/* Back edge */}
      <CuboidCollider args={[1.37, 0.1, 0.1]} position={[0, -0.1, -0.76]} /> {/* Front edge */}

      {/* Main table surface */}
      <mesh receiveShadow castShadow position={[0, 0, 0]}>
        <boxGeometry args={[2.74, 0.05, 1.525]} />
        <meshStandardMaterial
          color="#0e4c1f"
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Table edges */}
      <TableEdges />
      
      {/* Lines */}
      <TableLines />
      
      {/* Net */}
      <Net />
      
      {/* Legs */}
      <TableLegs />
    </RigidBody>
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

function Net() {
  return (
    <group position={[0, 0.15, 0]}>
      {/* Net mesh */}
      <mesh>
        <boxGeometry args={[0.02, 0.15, 1.525]} />
        <meshStandardMaterial
          color="white"
          opacity={0.9}
          transparent
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      {/* Net posts */}
      <mesh position={[0, 0, 0.7625]} castShadow>
        <boxGeometry args={[0.03, 0.15, 0.03]} />
        <meshStandardMaterial color="#404040" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0, -0.7625]} castShadow>
        <boxGeometry args={[0.03, 0.15, 0.03]} />
        <meshStandardMaterial color="#404040" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  )
}

function TableEdges() {
  return (
    <>
      {/* Long edges */}
      <mesh position={[0, 0, 0.7625]} castShadow>
        <boxGeometry args={[2.74, 0.05, 0.05]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0, 0, -0.7625]} castShadow>
        <boxGeometry args={[2.74, 0.05, 0.05]} />
        <meshStandardMaterial color="white" />
      </mesh>
      
      {/* Short edges */}
      <mesh position={[1.37, 0, 0]} castShadow>
        <boxGeometry args={[0.05, 0.05, 1.525]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[-1.37, 0, 0]} castShadow>
        <boxGeometry args={[0.05, 0.05, 1.525]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </>
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
            color="#333"
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
      ))}
    </>
  )
}