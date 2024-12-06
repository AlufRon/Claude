import { useGLTF } from '@react-three/drei'
import { RigidBody } from '@react-three/rapier'

export default function Table() {
  return (
    <RigidBody type="fixed">
      <mesh receiveShadow castShadow>
        <boxGeometry args={[2.74, 0.05, 1.525]} />
        <meshStandardMaterial color="#2f8f2f" />
      </mesh>
      <TableLegs />
      <Net />
    </RigidBody>
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
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}
    </>
  )
}

function Net() {
  return (
    <mesh position={[0, 0.1, 0]}>
      <boxGeometry args={[0.02, 0.15, 1.525]} />
      <meshStandardMaterial color="white" opacity={0.7} transparent />
    </mesh>
  )
}