'use client'
import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, vec3, BallCollider } from '@react-three/rapier'
import { useGameStore } from '@/store/gameStore'

const BALL_RADIUS = 0.02
const INITIAL_SPEED = 0.6
const BOUNCE_VELOCITY_Y = 0.4
const TABLE_HEIGHT = 0.0

export default function Ball() {
  const ballRef = useRef()
  const { isPlaying, isPaused } = useGameStore()
  const directionRef = useRef(1)
  const lastBouncePos = useRef(0)
  
  useFrame(() => {
    if (!ballRef.current || !isPlaying || isPaused) return
    
    const pos = ballRef.current.translation()
    const vel = ballRef.current.linvel()

    // Check for table bounce
    if (pos.y < TABLE_HEIGHT + BALL_RADIUS && vel.y < 0) {
      // Only bounce if we're far enough from last bounce
      if (Math.abs(pos.x - lastBouncePos.current) > 0.5) {
        lastBouncePos.current = pos.x
        
        // Calculate next arc
        const distanceToEnd = directionRef.current > 0 ? 1.2 - pos.x : -1.2 - pos.x
        const horizontalSpeed = INITIAL_SPEED * directionRef.current
        
        ballRef.current.setLinvel(vec3({
          x: horizontalSpeed,
          y: BOUNCE_VELOCITY_Y, // Upward velocity for arc
          z: 0
        }))
      }
    }

    // Reset and change direction at ends
    if (Math.abs(pos.x) > 1.2) {
      directionRef.current *= -1
      resetBall()
    }

    // Reset if ball goes too high or too low
    if (pos.y > 1 || pos.y < -1) {
      resetBall()
    }
  })

  const resetBall = () => {
    if (!ballRef.current) return

    const startX = directionRef.current > 0 ? -1.2 : 1.2
    ballRef.current.setTranslation(vec3({ x: startX, y: 0.3, z: 0 }))
    
    const horizontalSpeed = INITIAL_SPEED * directionRef.current
    ballRef.current.setLinvel(vec3({
      x: horizontalSpeed,
      y: 0.1, // Slight upward velocity
      z: 0
    }))
  }

  useEffect(() => {
    if (isPlaying && ballRef.current) {
      resetBall()
    }
  }, [isPlaying])

  return (
    <RigidBody
      ref={ballRef}
      colliders={false}
      position={[-1.2, 0.3, 0]}
      restitution={0.95}
      friction={0.15}
      linearDamping={0}
      angularDamping={0}
      gravityScale={0.8} // Reduced gravity for more graceful arcs
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