'use client'

import { useRef } from 'react'
import { RigidBody } from '@react-three/rapier'

export default function Paddle({ position, color }: { position: [number, number, number], color: string }) {
  const ref = useRef()

  return (
    <RigidBody position={position} type="kinematicPosition" ref={ref}>
      <mesh castShadow>
        <cylinderGeometry args={[0.075, 0.075, 0.02, 32]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, -0.06, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 32]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
    </RigidBody>
  )
}