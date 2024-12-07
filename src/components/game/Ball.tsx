'use client'
import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, vec3, BallCollider } from '@react-three/rapier'
import { useGameStore } from '@/store/gameStore'

const BALL_RADIUS = 0.02
const INITIAL_SPEED_X = 2.0  // Increased horizontal speed
const BOUNCE_VELOCITY_Y = 1.2  // Increased bounce height
const TABLE_HEIGHT = 0.0
const TABLE_WIDTH = 1.35  // Adjusted to table edge
const TABLE_DEPTH = 0.6

export default function Ball() {
  const ballRef = useRef()
  const { isPlaying, isPaused } = useGameStore()
  const directionRef = useRef(1)
  const lastBounceX = useRef(0)

  useFrame(() => {
    if (!ballRef.current || !isPlaying || isPaused) return

    const pos = ballRef.current.translation()
    const vel = ballRef.current.linvel()

    // Only bounce when hitting table and far enough from last bounce
    if (pos.y < TABLE_HEIGHT + BALL_RADIUS && vel.y < 0 && 
        Math.abs(pos.x - lastBounceX.current) > 1.0) {
      lastBounceX.current = pos.x
      
      // Keep horizontal direction until reaching table edge
      const currentDirection = directionRef.current
      
      ballRef.current.setLinvel(vec3({
        x: INITIAL_SPEED_X * currentDirection,
        y: BOUNCE_VELOCITY_Y,
        z: 0
      }))
    }

    // Change direction only at table edges
    if (Math.abs(pos.x) > TABLE_WIDTH && Math.sign(pos.x) === directionRef.current) {
      directionRef.current *= -1
      resetBall()
    }

    // Ensure the ball stays within table boundaries (Z-axis)
    if (Math.abs(pos.z) > TABLE_DEPTH) {
      ballRef.current.setTranslation(vec3({
        x: pos.x,
        y: pos.y,
        z: Math.sign(pos.z) * TABLE_DEPTH
      }))
      ballRef.current.setLinvel(vec3({
        x: vel.x,
        y: vel.y,
        z: -vel.z * 0.5
      }))
    }

    // Reset if ball goes too high or too low
    if (pos.y < -0.5 || pos.y > 2) {
      resetBall()
    }
  })

  const resetBall = () => {
    if (!ballRef.current) return
    
    const startX = -1.2  // Always start from the same side
    ballRef.current.setTranslation(vec3({ x: startX, y: 0.3, z: 0 }))
    directionRef.current = 1  // Reset direction
    
    ballRef.current.setLinvel(vec3({
      x: INITIAL_SPEED_X,
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
      gravityScale={1.0}
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