'use client'
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, vec3 } from '@react-three/rapier'
import { useGameStore } from '@/store/gameStore'

export default function Ball() {
  const ballRef = useRef()
  const { isPlaying, isPaused, incrementScore } = useGameStore()
  const [initialImpulseApplied, setInitialImpulseApplied] = useState(false)

  useFrame(() => {
    if (!ballRef.current || !isPlaying || isPaused) return

    const pos = ballRef.current.translation()
    const vel = ballRef.current.linvel()

    // Apply initial impulse
    if (!initialImpulseApplied) {
      ballRef.current.applyImpulse(vec3({ x: 0.1, y: 0.05, z: 0 }), true)
      setInitialImpulseApplied(true)
    }

    // Keep the ball from going too slow horizontally
    const minSpeed = 0.1
    if (Math.abs(vel.x) < minSpeed) {
      const direction = vel.x >= 0 ? 1 : -1
      ballRef.current.setLinvel(vec3({
        x: direction * minSpeed,
        y: vel.y,
        z: vel.z
      }))
    }

    // Keep the ball from going too vertical
    const maxVerticalSpeed = 0.15
    if (Math.abs(vel.y) > maxVerticalSpeed) {
      ballRef.current.setLinvel(vec3({
        x: vel.x,
        y: Math.sign(vel.y) * maxVerticalSpeed,
        z: vel.z
      }))
    }

    // Scoring
    if (Math.abs(pos.x) > 2) {
      incrementScore(pos.x > 0 ? 1 : 2)
      resetBall()
    }

    // Reset if ball goes too high/low
    if (Math.abs(pos.y) > 2 || Math.abs(pos.z) > 1) {
      resetBall()
    }
  })

  const resetBall = () => {
    if (!ballRef.current) return
    
    ballRef.current.setTranslation(vec3({ x: 0, y: 0.3, z: 0 }))
    ballRef.current.setLinvel(vec3({ x: 0, y: 0, z: 0 }))
    ballRef.current.setAngvel(vec3({ x: 0, y: 0, z: 0 }))
    setInitialImpulseApplied(false)
  }

  return (
    <RigidBody
      ref={ballRef}
      colliders="ball"
      restitution={0.9}
      friction={0.2}
      linearDamping={0.2}
      angularDamping={0.2}
      position={[0, 0.3, 0]}
    >
      <mesh castShadow>
        <sphereGeometry args={[0.02]} />
        <meshStandardMaterial 
          color="white"
          emissive="white"
          emissiveIntensity={0.2}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>
    </RigidBody>
  )
}