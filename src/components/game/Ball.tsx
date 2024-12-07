'use client'
import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, vec3 } from '@react-three/rapier'
import { useGameStore } from '@/store/gameStore'

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
      const initialSpeed = 0.3
      const direction = Math.random() > 0.5 ? 1 : -1
      ballRef.current.applyImpulse(vec3({ 
        x: direction * initialSpeed, 
        y: 0.1, 
        z: (Math.random() - 0.5) * 0.2 
      }), true)
      setInitialImpulseApplied(true)
      lastHitTime.current = performance.now()
      consecutiveHits.current = 0
    }

    // Speed control
    const currentSpeed = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z)
    const maxSpeed = 0.8
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

    // Scoring and reset conditions
    if (Math.abs(pos.x) > 1.5) {
      incrementScore(pos.x > 0 ? 1 : 2)
      resetBall()
    }

    // Reset if ball goes too high/low or too far forward/back
    if (pos.y < -0.5 || pos.y > 2 || Math.abs(pos.z) > 1) {
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
      colliders="ball"
      restitution={0.9}
      friction={0.2}
      linearDamping={0.1}
      angularDamping={0.2}
      position={[0, 0.3, 0]}
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