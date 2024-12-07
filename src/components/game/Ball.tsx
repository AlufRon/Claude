'use client'
import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, vec3, BallCollider } from '@react-three/rapier'
import { useGameStore } from '@/store/gameStore'

const BALL_RADIUS = 0.02
const INITIAL_SPEED = 1.2  // Increased horizontal speed
const BOUNCE_VELOCITY_Y = 0.8  // Increased upward bounce
const TABLE_HEIGHT = 0.0

export default function Ball() {
  const ballRef = useRef()
  const { isPlaying, isPaused } = useGameStore()
  const directionRef = useRef(1)
  
  useFrame(() => {
    if (!ballRef.current || !isPlaying || isPaused) return
    
    const pos = ballRef.current.translation()
    const vel = ballRef.current.linvel()

    // Check for table bounce
    if (pos.y < TABLE_HEIGHT + BALL_RADIUS && vel.y < 0) {
      // Create a high arc that crosses the entire table
      ballRef.current.setLinvel(vec3({
        x: INITIAL_SPEED * directionRef.current,
        y: BOUNCE_VELOCITY_Y,
        z: 0
      }))
      directionRef.current *= -1  // Change direction immediately after bounce
    }

    // Reset if ball goes too high or too low
    if (pos.y < -1 || pos.y > 2 || Math.abs(pos.x) > 1.5) {
      resetBall()
    }
  })

  const resetBall = () => {
    if (!ballRef.current) return
    
    const startX = -1.2  // Always start from the same side
    ballRef.current.setTranslation(vec3({ x: startX, y: 0.3, z: 0 }))
    directionRef.current = 1  // Reset direction
    
    ballRef.current.setLinvel(vec3({
      x: INITIAL_SPEED,
      y: 0.2,
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
      gravityScale={0.6}  // Reduced gravity for higher arcs
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