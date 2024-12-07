'use client'
import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, vec3, BallCollider } from '@react-three/rapier'
import { useGameStore } from '@/store/gameStore'

const BALL_RADIUS = 0.02
const BALL_SPEED = 0.6 // Consistent speed for back and forth

export default function Ball() {
  const ballRef = useRef()
  const { isPlaying, isPaused } = useGameStore()
  const directionRef = useRef(1)

  useFrame(() => {
    if (!ballRef.current || !isPlaying || isPaused) return
    
    const pos = ballRef.current.translation()

    // Reset and reverse direction when ball reaches either end
    if (Math.abs(pos.x) > 1.2) {
      directionRef.current *= -1
      ballRef.current.setTranslation(vec3({ 
        x: Math.sign(pos.x) * 1.2, // Keep at edge
        y: 0.3,
        z: 0 
      }))
      ballRef.current.setLinvel(vec3({ 
        x: directionRef.current * BALL_SPEED,
        y: 0.1,
        z: 0
      }))
    }

    // Keep ball on track
    const vel = ballRef.current.linvel()
    if (Math.abs(vel.x) !== BALL_SPEED) {
      ballRef.current.setLinvel(vec3({
        x: directionRef.current * BALL_SPEED,
        y: vel.y,
        z: 0
      }))
    }
  })

  useEffect(() => {
    if (isPlaying && ballRef.current) {
      // Initial position and velocity
      ballRef.current.setTranslation(vec3({ x: -1.2, y: 0.3, z: 0 }))
      ballRef.current.setLinvel(vec3({ x: BALL_SPEED, y: 0.1, z: 0 }))
    }
  }, [isPlaying])

  return (
    <RigidBody
      ref={ballRef}
      colliders={false}
      position={[0, 0.3, 0]}
      restitution={0.95}
      friction={0.15}
      linearDamping={0}
      angularDamping={0}
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