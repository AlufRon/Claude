'use client'
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { HitEffect } from '../effects/HitEffect'

export default function Ball() {
  const ref = useRef()
  const [hitEffects, setHitEffects] = useState<{position: [number,number,number], id: number}[]>([])

  useFrame(() => {
    if (ref.current) {
      const pos = ref.current.translation()
      if (Math.abs(pos.z) > 0.7) {
        setHitEffects(effects => [...effects, {
          position: [pos.x, pos.y, pos.z],
          id: Date.now()
        }])
      }
    }
  })

  return (
    <>
      <RigidBody ref={ref} colliders="ball" restitution={0.8}>
        <mesh castShadow>
          <sphereGeometry args={[0.02]} />
          <meshStandardMaterial color="white" />
        </mesh>
      </RigidBody>
      {hitEffects.map(effect => (
        <HitEffect key={effect.id} position={effect.position} />
      ))}
    </>
  )
}