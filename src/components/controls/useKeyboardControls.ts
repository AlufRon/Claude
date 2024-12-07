import { useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'

export function useKeyboardControls() {
  const { isPlaying, isPaused, setPaused } = useGameStore()

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          if (isPlaying) {
            setPaused(!isPaused)
          }
          break
        // Add more controls as needed
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isPlaying, isPaused, setPaused])
}