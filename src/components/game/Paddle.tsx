'use client'
import { useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { useGameStore } from '@/store/gameStore'

type PaddleProps = {
  position: [number, number, number]
  color: string
  playerId: 1 | 2
}

export default function Paddle({ position, color, playerId }: PaddleProps) {
  const ref = useRef()
  const { isPlaying, isPaused, updatePaddlePosition } = useGameStore()

  const followMouse = useCallback((e: MouseEvent) => {
    if (!ref.current || !isPlaying || isPaused) return

    const bounds = (e.target as HTMLElement).getBoundingClientRect()
    const x = ((e.clientX - bounds.left) / bounds.width) * 2 - 1
    const z = ((e.clientY - bounds.top) / bounds.height) * 2 - 1

    // Limit paddle movement
    const clampedX = position[0] // Keep X position fixed
    const clampedZ = Math.max(-0.7, Math.min(0.7, z))

    ref.current.setNextKinematicTranslation({
      x: clampedX,
      y: position[1],
      z: clampedZ
    })

    updatePaddlePosition(playerId, {
      x: clampedX,
      y: position[1],
      z: clampedZ
    })
  }, [isPlaying, isPaused, playerId, position])

  useFrame(() => {
    if (!ref.current || !isPlaying || isPaused) return
    // Add AI logic here for player 2
  })

  return (
    <RigidBody position={position} type="kinematicPosition" ref={ref}>
      <mesh castShadow>
        <cylinderGeometry args={[0.075, 0.075, 0.02, 32]} />
        <meshStandardMaterial 
          color={color}
          roughness={0.3}
          metalness={0.7}
          emissive={color}
          emissiveIntensity={0.2}
        />
      </mesh>
      <mesh position={[0, -0.06, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 32]} />
        <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.2} />
      </mesh>
    </RigidBody>
  )
}
