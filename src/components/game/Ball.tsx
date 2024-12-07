'use client'
import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { RigidBody, vec3, BallCollider } from '@react-three/rapier'
import { useGameStore } from '@/store/gameStore'

// Updated constants for better physics
const BALL_RADIUS = 0.02
const MIN_HEIGHT = -0.5
const MAX_HEIGHT = 2
const TABLE_BOUNDS = {
  x: 1.37,  // Match table dimensions exactly
  z: 0.76
}

// Rest of the file remains the same except RigidBody props:
 export default function Ball() {
  // ... existing code ...

  return (
    <RigidBody
      ref={ballRef}
      colliders={false}
      position={[0, 0.3, 0]}
      restitution={0.95}  // Increased for bouncier ball
      friction={0.15}     // Reduced for smoother movement
      linearDamping={0.1}
      angularDamping={0.2}
      // ... rest of the component stays the same
    >
      <BallCollider args={[BALL_RADIUS]} restitution={0.95} friction={0.15} />
      {/* ... rest remains the same ... */}
    </RigidBody>
  )
}