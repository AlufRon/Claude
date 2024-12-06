'use client'

import { useEffect } from 'react'
import { useGameStore } from '@/hooks/useGameStore'

export default function GameControls() {
  const { paddleA, updatePaddleA, paddleB, updatePaddleB } = useGameStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const moveSpeed = 0.1
      switch(e.key) {
        case 'w':
          updatePaddleA({ ...paddleA, z: paddleA.z - moveSpeed })
          break
        case 's':
          updatePaddleA({ ...paddleA, z: paddleA.z + moveSpeed })
          break
        case 'ArrowUp':
          updatePaddleB({ ...paddleB, z: paddleB.z - moveSpeed })
          break
        case 'ArrowDown':
          updatePaddleB({ ...paddleB, z: paddleB.z + moveSpeed })
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [paddleA, paddleB, updatePaddleA, updatePaddleB])

  return null
}