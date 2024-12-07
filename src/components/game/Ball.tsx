'use client'
import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, vec3, BallCollider } from '@react-three/rapier'
import { useGameStore } from '@/store/gameStore'

const BALL_RADIUS = 0.02
const INITIAL_SPEED_X = 1.2 // Horizontal speed across the table
const BOUNCE_VELOCITY_Y = 0.7 // Bounce height
const TABLE_HEIGHT = 0.0
const TABLE_WIDTH = 1.2 // Half-width of the table for boundary checks
const TABLE_DEPTH = 0.6 // Half-depth of the table for Z-axis boundaries

export default function Ball() {
  const ballRef = useRef()
  const { isPlaying, isPaused } = useGameStore()
  const directionRef = useRef(1) // 1 for right, -1 for left

  useFrame(() => {
    if (!ballRef.current || !isPlaying || isPaused) return

    const pos = ballRef.current.translation()
    const vel = ballRef.current.linvel()

    // Bounce logic: When the ball hits the table
    if (pos.y < TABLE_HEIGHT + BALL_RADIUS && vel.y < 0) {
      ballRef.current.setLinvel(vec3({
        x: INITIAL_SPEED_X * directionRef.current,
        y: BOUNCE_VELOCITY_Y,
        z: 0
      }))
      directionRef.current *= -1 // Alternate direction after each bounce
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
        z: -vel.z * 0.5 // Reverse and dampen Z velocity
      }))
    }

    // Reset if ball goes out of bounds
    if (pos.y < -0.5 || pos.y > 2 || Math.abs(pos.x) > TABLE_WIDTH) {
      resetBall()
    }
  })

  const resetBall = () => {
    if (!ballRef.current) return

    ballRef.current.setTranslation(vec3({ x: -1.2, y: 0.3, z: 0 }))
    ballRef.current.setLinvel(vec3({
      x: INITIAL_SPEED_X,
      y: 0.2,
      z: 0
    }))
    directionRef.current = 1 // Reset direction to right
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