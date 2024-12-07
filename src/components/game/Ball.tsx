'use client'
import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, vec3, BallCollider } from '@react-three/rapier'
import { useGameStore } from '@/store/gameStore'

const BALL_RADIUS = 0.02
const MIN_HEIGHT = -0.5
const MAX_HEIGHT = 2
const TABLE_BOUNDS = {
  x: 1.5,
  z: 0.8
}

export default function Ball() {
  const ballRef = useRef()
  const { isPlaying, isPaused, incrementScore } = useGameStore()
  const [initialImpulseApplied, setInitialImpulseApplied] = useState(false)
  const lastHitTime = useRef(0)
  const consecutiveHits = useRef(0)

  useEffect(() => {
    if (!isPlaying) {
      setInitialImpulseApplied(false)
    }
  }, [isPlaying])

  useFrame(() => {
    if (!ballRef.current || !isPlaying || isPaused) return

    const pos = ballRef.current.translation()
    const vel = ballRef.current.linvel()

    // Apply initial impulse
    if (!initialImpulseApplied) {
      const initialSpeed = 0.25
      const direction = Math.random() > 0.5 ? 1 : -1
      ballRef.current.setTranslation({
        x: 0,
        y: 0.3,
        z: 0
      })
      ballRef.current.applyImpulse(vec3({ 
        x: direction * initialSpeed, 
        y: 0.1, 
        z: (Math.random() - 0.5) * 0.2 
      }), true)
      setInitialImpulseApplied(true)
      lastHitTime.current = performance.now()
      consecutiveHits.current = 0
      return
    }

    // Speed control
    const currentSpeed = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z)
    const maxSpeed = 0.6
    const minSpeed = 0.2

    if (currentSpeed > maxSpeed) {
      const scale = maxSpeed / currentSpeed
      ballRef.current.setLinvel(vec3({
        x: vel.x * scale,
        y: vel.y * scale,
        z: vel.z * scale
      }))
    } else if (currentSpeed < minSpeed && performance.now() - lastHitTime.current > 500) {
      const scale = minSpeed / currentSpeed
      ballRef.current.setLinvel(vec3({
        x: vel.x * scale,
        y: vel.y * scale,
        z: vel.z * scale
      }))
    }

    // Keep the ball from going too vertical
    const maxVerticalRatio = 0.8
    const verticalSpeed = Math.abs(vel.y)
    const horizontalSpeed = Math.sqrt(vel.x * vel.x + vel.z * vel.z)
    if (verticalSpeed > horizontalSpeed * maxVerticalRatio) {
      const newVerticalSpeed = horizontalSpeed * maxVerticalRatio
      ballRef.current.setLinvel(vec3({
        x: vel.x,
        y: (vel.y > 0 ? 1 : -1) * newVerticalSpeed,
        z: vel.z
      }))
    }

    // Check bounds and reset conditions
    if (
      pos.y < MIN_HEIGHT || 
      pos.y > MAX_HEIGHT || 
      Math.abs(pos.z) > TABLE_BOUNDS.z || 
      Math.abs(pos.x) > TABLE_BOUNDS.x
    ) {
      if (Math.abs(pos.x) > TABLE_BOUNDS.x) {
        incrementScore(pos.x > 0 ? 1 : 2)
      }
      resetBall()
    }
  })

  const resetBall = () => {
    if (!ballRef.current) return
    
    ballRef.current.setTranslation(vec3({ x: 0, y: 0.3, z: 0 }))
    ballRef.current.setLinvel(vec3({ x: 0, y: 0, z: 0 }))
    ballRef.current.setAngvel(vec3({ x: 0, y: 0, z: 0 }))
    setInitialImpulseApplied(false)
    consecutiveHits.current = 0
  }

  return (
    <RigidBody
      ref={ballRef}
      colliders={false}
      position={[0, 0.3, 0]}
      restitution={0.9}
      friction={0.2}
      linearDamping={0.1}
      angularDamping={0.2}
      onCollisionEnter={() => {
        if (ballRef.current) {
          lastHitTime.current = performance.now()
          consecutiveHits.current++
          
          // Increase ball speed slightly with each hit
          if (consecutiveHits.current > 2) {
            const vel = ballRef.current.linvel()
            const speedIncrease = 1.05
            ballRef.current.setLinvel(vec3({
              x: vel.x * speedIncrease,
              y: vel.y * speedIncrease,
              z: vel.z * speedIncrease
            }))
          }
        }
      }}
    >
      <BallCollider args={[BALL_RADIUS]} restitution={0.9} friction={0.2} />
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