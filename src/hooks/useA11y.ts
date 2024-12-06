import { useEffect } from 'react'

export const useA11y = () => {
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Handle escape key
        document.getElementById('game-menu')?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  }, [])

  return {
    announceScore: (score: string) => {
      const announcer = document.querySelector('[role="status"]')
      if (announcer) {
        announcer.textContent = `Score is now ${score}`
      }
    }
  }
}