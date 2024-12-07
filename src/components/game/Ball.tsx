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

    // Handle Z-axis boundaries and resets as before...
    // Rest of the code remains the same
