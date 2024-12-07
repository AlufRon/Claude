'use client'
import { useRef, useEffect } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { useGameStore } from '@/store/gameStore'

type PaddleProps = {
  position: [number, number, number]
  color: string
  playerId: 1 | 2
}

export default function Paddle({ position, color, playerId }: PaddleProps) {
  const paddleRef = useRef()
  const { isPlaying, isPaused } = useGameStore()
  const { camera } = useThree()

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!paddleRef.current || !isPlaying || isPaused) return

      // Get mouse position in normalized device coordinates (-1 to +1)
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = -(event.clientY / window.innerHeight) * 2 + 1

      // Convert to world space
      const vector = camera.position.clone()
      vector.unproject(camera)

      // Calculate paddle position
      const paddleX = position[0] // Keep X fixed
      const paddleY = 0.1 // Keep Y fixed
      const paddleZ = Math.max(-0.6, Math.min(0.6, y * 0.8)) // Limit Z movement

      paddleRef.current.setNextKinematicTranslation({
        x: paddleX,
        y: paddleY,
        z: paddleZ
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [camera, isPlaying, isPaused, position])

  return (
    <RigidBody position={position} type="kinematicPosition" ref={paddleRef}>
      {/* Paddle head */}
      <group rotation={[0.3, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.15, 0.15, 0.01]} /> 
          <meshStandardMaterial 
            color={color}
            roughness={0.3}
            metalness={0.4}
            emissive={color}
            emissiveIntensity={0.2}
          />
        </mesh>
        {/* Rubber layers */}
        <mesh position={[0, 0, 0.005]} castShadow>
          <boxGeometry args={[0.14, 0.14, 0.001]} />
          <meshStandardMaterial 
            color="black"
            roughness={0.8}
            metalness={0}
          />
        </mesh>
      </group>
      {/* Handle */}
      <mesh position={[0, -0.1, 0]} castShadow>
        <cylinderGeometry args={[0.01, 0.01, 0.1, 32]} />
        <meshStandardMaterial 
          color="#4a4a4a"
          roughness={0.5}
          metalness={0.8}
        />
      </mesh>
    </RigidBody>
  )
}