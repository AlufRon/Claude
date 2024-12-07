'use client'
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Trail } from '@react-three/drei'
import { RigidBody, vec3 } from '@react-three/rapier'
import { HitEffect } from '../effects/HitEffect'
import { useGameStore } from '@/store/gameStore'

export default function Ball() {
  const ballRef = useRef()
  const [hitEffects, setHitEffects] = useState<{position: [number,number,number], id: number}[]>([])
  const { isPlaying, isPaused, updateBallState, incrementScore } = useGameStore()

  useFrame(() => {
    if (!ballRef.current || !isPlaying || isPaused) return

    const pos = ballRef.current.translation()
    const vel = ballRef.current.linvel()

    // Update ball state
    updateBallState(
      { x: pos.x, y: pos.y, z: pos.z },
      { x: vel.x, y: vel.y, z: vel.z }
    )

    // Check for scoring
    if (Math.abs(pos.x) > 1.5) {
      incrementScore(pos.x > 0 ? 1 : 2)
      resetBall()
    }

    // Check for table hits
    if (Math.abs(pos.z) > 0.7) {
      setHitEffects(effects => [
        ...effects.slice(-5),
        {
          position: [pos.x, pos.y, pos.z],
          id: Date.now()
        }
      ])
    }

    // Reset if ball falls
    if (pos.y < -2) {
      resetBall()
    }
  })

  const resetBall = () => {
    if (!ballRef.current) return
    ballRef.current.setTranslation(vec3({ x: 0, y: 1, z: 0 }))
    ballRef.current.setLinvel(vec3({ x: 0, y: 0, z: 0 }))
    ballRef.current.setAngvel(vec3({ x: 0, y: 0, z: 0 }))
  }

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
