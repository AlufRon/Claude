'use client'
import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { RigidBody, CuboidCollider } from '@react-three/rapier'
import { useGameStore } from '@/store/gameStore'

type PaddleProps = {
  position: [number, number, number]
  color: string
  playerId: 1 | 2
}

export default function Paddle({ position, color, playerId }: PaddleProps) {
  const paddleRef = useRef()
  const { isPlaying, isPaused, updatePaddlePosition } = useGameStore()
  const { camera, viewport } = useThree()
  const targetPosition = useRef({ x: position[0], y: position[1], z: position[2] })
  const velocity = useRef({ z: 0 })
  
  // Base paddle rotation based on player side
  const baseRotation = [Math.PI * 0.15, playerId === 1 ? Math.PI * 0.2 : -Math.PI * 0.2, 0]

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isPlaying || isPaused) return

      // Calculate mouse position in normalized coordinates (-1 to +1)
      const y = -(event.clientY / window.innerHeight) * 2 + 1
      
      // Convert to table coordinates with smooth limits
      const paddleZ = Math.max(-0.6, Math.min(0.6, y * 0.7))
      targetPosition.current.z = paddleZ
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [isPlaying, isPaused])

  useFrame((state, delta) => {
    if (!paddleRef.current || !isPlaying || isPaused) return

    // Smooth movement using velocity
    const currentPos = paddleRef.current.translation()
    const diff = targetPosition.current.z - currentPos.z
    velocity.current.z = diff * 15 // Increased for more responsive movement

    // Apply damping
    const damping = 0.85
    velocity.current.z *= damping

    // Update position
    paddleRef.current.setNextKinematicTranslation({
      x: position[0],
      y: position[1],
      z: currentPos.z + velocity.current.z * delta
    })

    // Update store
    updatePaddlePosition(playerId, {
      x: currentPos.x,
      y: currentPos.y,
      z: currentPos.z
    })
  })

  return (
    <RigidBody 
      position={position} 
      type="kinematicPosition" 
      ref={paddleRef}
      colliders={false}
    >
      {/* Paddle collider */}
      <CuboidCollider 
        args={[0.08, 0.08, 0.01]} 
        restitution={0.85} 
        friction={0.2} 
        rotation={baseRotation}
      />
      
      {/* Paddle head */}
      <group rotation={baseRotation}>
        {/* Main paddle body */}
        <mesh castShadow>
          <boxGeometry args={[0.15, 0.15, 0.015]} />
          <meshStandardMaterial 
            color={color}
            roughness={0.3}
            metalness={0.4}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </mesh>
        
        {/* Red rubber layer */}
        <mesh position={[0, 0, 0.008]} castShadow>
          <boxGeometry args={[0.14, 0.14, 0.001]} />
          <meshStandardMaterial 
            color="#ff0000"
            roughness={0.9}
            metalness={0}
          />
        </mesh>

        {/* Black rubber layer */}
        <mesh position={[0, 0, -0.008]} castShadow>
          <boxGeometry args={[0.14, 0.14, 0.001]} />
          <meshStandardMaterial 
            color="black"
            roughness={0.9}
            metalness={0}
          />
        </mesh>

        {/* Handle */}
        <group position={[0, -0.13, 0]}>
          {/* Handle grip */}
          <mesh castShadow>
            <cylinderGeometry args={[0.015, 0.02, 0.12, 32]} />
            <meshStandardMaterial 
              color="#4a4a4a"
              roughness={0.5}
              metalness={0.8}
            />
          </mesh>

          {/* Handle end cap */}
          <mesh position={[0, -0.06, 0]} castShadow>
            <cylinderGeometry args={[0.022, 0.022, 0.02, 32]} />
            <meshStandardMaterial 
              color="#333333"
              roughness={0.4}
              metalness={0.9}
            />
          </mesh>
        </group>
      </group>
    </RigidBody>
  )
}