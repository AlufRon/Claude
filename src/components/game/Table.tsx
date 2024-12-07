'use client'
import { RigidBody, CuboidCollider } from '@react-three/rapier'

// Colors and materials
const TABLE_GREEN = '#0A5F38'
const TABLE_EDGE = '#F0F0F0'
const TABLE_LEGS = '#2A2A2A'
const NET_COLOR = '#F8F8F8'

export default function Table() {
  return (
    <RigidBody type="fixed" colliders={false}>
      {/* Table surface collider */}
      <CuboidCollider args={[1.37, 0.1, 0.76]} position={[0, -0.1, 0]} restitution={0.8} />

      {/* Main table surface with texture */}
      <mesh receiveShadow castShadow position={[0, 0, 0]}>
        <boxGeometry args={[2.74, 0.05, 1.525]} />
        <meshStandardMaterial
          color={TABLE_GREEN}
          roughness={0.4}
          metalness={0.1}
          envMapIntensity={0.5}
        >
        </meshStandardMaterial>
      </mesh>

      {/* Table lines */}
      <TableLines />
      
      {/* Net with improved appearance */}
      <Net />
      
      {/* Edges */}
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
  // Create a grid of thin lines for net effect
  const netWidth = 0.02
  const netHeight = 0.15
  const netDepth = 1.525
  
  return (
    <group position={[0, netHeight/2, 0]}>
      {/* Main net structure */}
      <mesh castShadow>
        <boxGeometry args={[netWidth, netHeight, netDepth]} />
        <meshStandardMaterial 
          color={NET_COLOR}
          transparent
          opacity={0.9}
          roughness={0.5}
          metalness={0.1}
        />
      </mesh>

      {/* Net posts */}
      <mesh position={[0, 0, netDepth/2]} castShadow>
        <boxGeometry args={[0.03, netHeight*1.5, 0.03]} />
        <meshStandardMaterial
          color={TABLE_LEGS}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      <mesh position={[0, 0, -netDepth/2]} castShadow>
        <boxGeometry args={[0.03, netHeight*1.5, 0.03]} />
        <meshStandardMaterial
          color={TABLE_LEGS}
          roughness={0.3}
          metalness={0.7}
        />
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
        <meshStandardMaterial 
          color={TABLE_EDGE}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      <mesh position={[0, 0, -0.7625]} castShadow>
        <boxGeometry args={[2.74, 0.05, 0.05]} />
        <meshStandardMaterial 
          color={TABLE_EDGE}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      
      {/* Short edges */}
      <mesh position={[1.37, 0, 0]} castShadow>
        <boxGeometry args={[0.05, 0.05, 1.525]} />
        <meshStandardMaterial 
          color={TABLE_EDGE}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>
      <mesh position={[-1.37, 0, 0]} castShadow>
        <boxGeometry args={[0.05, 0.05, 1.525]} />
        <meshStandardMaterial 
          color={TABLE_EDGE}
          roughness={0.3}
          metalness={0.2}
        />
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
            color={TABLE_LEGS}
            roughness={0.3}
            metalness={0.7}
          />
        </mesh>
      ))}
    </>
  )
}