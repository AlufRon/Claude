'use client'

import { useRef } from 'react'
import { RigidBody } from '@react-three/rapier'
import { useFrame } from '@react-three/fiber'

export default function Ball() {
  const ref = useRef()

  useFrame(() => {
    if (ref.current) {
      // Ball physics logic here
    }
  })

  return (
    <RigidBody ref={ref} colliders="ball" restitution={0.8}>
      <mesh castShadow>
        <sphereGeometry args={[0.02]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </RigidBody>
  )
}