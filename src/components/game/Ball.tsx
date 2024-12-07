'use client'
import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, vec3, BallCollider } from '@react-three/rapier'
import { useGameStore } from '@/store/gameStore'

const BALL_RADIUS = 0.02
const TABLE_HEIGHT = 0.0
const TABLE_WIDTH = 1.35
const TABLE_DEPTH = 0.6

export default function Ball() {
  const ballRef = useRef()
  const { isPlaying, isPaused, ballParams } = useGameStore()
  const directionRef = useRef(1)

  useFrame(() => {
    if (!ballRef.current || !isPlaying || isPaused) return

    const pos = ballRef.current.translation()
    const vel = ballRef.current.linvel()

    // Change direction at table edges
    if (Math.abs(pos.x) > TABLE_WIDTH - 0.1) {  
      directionRef.current *= -1
      const newDirection = directionRef.current
      
      ballRef.current.setLinvel(vec3({
        x: ballParams.speed * newDirection,
        y: ballParams.bounceHeight,
        z: 0
      }))
    }

    // Bounce when hitting table
    if (pos.y < TABLE_HEIGHT + BALL_RADIUS && vel.y < 0) {
      ballRef.current.setLinvel(vec3({
        x: vel.x,
        y: ballParams.bounceHeight,
        z: 0
      }))
    }

    // Reset if ball goes too high or too low
    if (pos.y < -1 || pos.y > 5) {
      resetBall()
    }

    // Keep ball on table depth-wise
    if (Math.abs(pos.z) > TABLE_DEPTH) {
      ballRef.current.setTranslation(vec3({
        x: pos.x,
        y: pos.y,
        z: Math.sign(pos.z) * TABLE_DEPTH
      }))
      ballRef.current.setLinvel(vec3({
        x: vel.x,
        y: vel.y,
        z: 0
      }))
    }
  })

  const resetBall = () => {
    if (!ballRef.current) return
    
    const startX = -1.2
    ballRef.current.setTranslation(vec3({ x: startX, y: 0.5, z: 0 }))
    directionRef.current = 1
    
    ballRef.current.setLinvel(vec3({
      x: ballParams.speed,
      y: 0.5,
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
      position={[-1.2, 0.5, 0]}
      restitution={0.95}
      friction={0.1}
      linearDamping={0}
      angularDamping={0}
      gravityScale={ballParams.gravity}
    >
      <BallCollider args={[BALL_RADIUS]} restitution={0.95} friction={0.1} />
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