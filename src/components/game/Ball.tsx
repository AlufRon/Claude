'use client'
import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, vec3, BallCollider } from '@react-three/rapier'
import { useGameStore } from '@/store/gameStore'

const BALL_RADIUS = 0.02
const MIN_HEIGHT = -0.5
const MAX_HEIGHT = 2
const TABLE_BOUNDS = {
  x: 1.37,
  z: 0.76
}

export default function Ball() {
  const ballRef = useRef()
  const { isPlaying, isPaused, incrementScore } = useGameStore()
  const [initialImpulseApplied, setInitialImpulseApplied] = useState(false)

  // Force reset initial impulse when play state changes
  useEffect(() => {
    setInitialImpulseApplied(false)
  }, [isPlaying])

  useFrame(() => {
    if (!ballRef.current || !isPlaying || isPaused) return

    const pos = ballRef.current.translation()

    // Apply initial impulse with stronger force
    if (!initialImpulseApplied) {
      const initialSpeed = 0.5 // Increased initial speed
      const direction = Math.random() > 0.5 ? 1 : -1
      
      ballRef.current.setTranslation(vec3({ x: 0, y: 0.3, z: 0 }))
      ballRef.current.setLinvel(vec3({ x: 0, y: 0, z: 0 }))
      ballRef.current.applyImpulse(
        vec3({ 
          x: direction * initialSpeed, 
          y: 0.1,
          z: (Math.random() - 0.5) * 0.2
        }), 
        true
      )
      setInitialImpulseApplied(true)
      return
    }

    // Rest of the code remains the same...
  })

  return (
    <RigidBody
      ref={ballRef}
      colliders={false}
      position={[0, 0.3, 0]}
      restitution={0.95}
      friction={0.15}
      linearDamping={0.1}
      angularDamping={0.2}
    >
      <BallCollider args={[BALL_RADIUS]} restitution={0.95} friction={0.15} />
      <mesh castShadow>
        <sphereGeometry args={[BALL_RADIUS, 32, 32]} />
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