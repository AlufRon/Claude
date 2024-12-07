'use client'
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Trail, useTrail } from '@react-three/drei'
import { RigidBody, vec3 } from '@react-three/rapier'
import { HitEffect } from '../effects/HitEffect'

export default function Ball() {
  const ballRef = useRef()
  const [hitEffects, setHitEffects] = useState<{position: [number,number,number], id: number}[]>([])

  useFrame(() => {
    if (ballRef.current) {
      const pos = ballRef.current.translation()
      if (Math.abs(pos.z) > 0.7) {
        setHitEffects(effects => [
          ...effects.slice(-5), // Keep only last 5 effects
          {
            position: [pos.x, pos.y, pos.z],
            id: Date.now()
          }
        ])
      }
      
      // Reset ball if it falls off table
      if (pos.y < -2) {
        ballRef.current.setTranslation(vec3({ x: 0, y: 1, z: 0 }))
        ballRef.current.setLinvel(vec3({ x: 0, y: 0, z: 0 }))
      }
    }
  })

  return (
    <>
      <RigidBody ref={ballRef} colliders="ball" restitution={0.8} friction={0.2}>
        <Trail 
          width={0.05}
          length={8}
          color={"#ffffff"}
          attenuation={(t) => t * t}
        >
          <mesh castShadow>
            <sphereGeometry args={[0.02]} />
            <meshStandardMaterial 
              color="white" 
              emissive="#ffffff"
              emissiveIntensity={0.2}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>
        </Trail>
      </RigidBody>
      
      {hitEffects.map(effect => (
        <HitEffect key={effect.id} position={effect.position} />
      ))}
    </>
  )
}