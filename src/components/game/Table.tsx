'use client'
import { RigidBody } from '@react-three/rapier'

export default function Table() {
  return (
    <RigidBody type="fixed" colliders="hull">
      {/* Main table surface */}
      <mesh receiveShadow castShadow position={[0, 0, 0]}>
        <boxGeometry args={[2.74, 0.05, 1.525]} />
        <meshStandardMaterial
          color="#0e4c1f"
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Table lines */}
      <TableLines />

      {/* Net */}
      <Net />

      {/* Table edges */}
      <TableEdges />

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
  // Net posts
  const postGeometry = [0.03, 0.15, 0.03]
  const postPositions = [
    [0, 0.075, 0.7625],
    [0, 0.075, -0.7625]
  ]

  return (
    <>
      {/* Net mesh */}
      <mesh position={[0, 0.15, 0]}>
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
      {postPositions.map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <boxGeometry args={postGeometry} />
          <meshStandardMaterial
            color="#404040"
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
      ))}
    </>
  )
}

function TableEdges() {
  const edgeGeometry = [2.74, 0.05, 0.05]
  const sideEdgeGeometry = [0.05, 0.05, 1.525]
  
  return (
    <>
      {/* Long edges */}
      <mesh position={[0, 0, 0.7625]} castShadow>
        <boxGeometry args={edgeGeometry} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0, 0, -0.7625]} castShadow>
        <boxGeometry args={edgeGeometry} />
        <meshStandardMaterial color="white" />
      </mesh>
      
      {/* Short edges */}
      <mesh position={[1.37, 0, 0]} castShadow>
        <boxGeometry args={sideEdgeGeometry} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[-1.37, 0, 0]} castShadow>
        <boxGeometry args={sideEdgeGeometry} />
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