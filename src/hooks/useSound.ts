import { useEffect, useRef } from 'react'

interface SoundLibrary {
  hit: HTMLAudioElement
  score: HTMLAudioElement
  win: HTMLAudioElement
}

export function useSound() {
  const sounds = useRef<SoundLibrary>()

  useEffect(() => {
    sounds.current = {
      hit: new Audio('/sounds/hit.mp3'),
      score: new Audio('/sounds/score.mp3'),
      win: new Audio('/sounds/win.mp3')
    }
  }, [])

  return {
    playSound: (type: keyof SoundLibrary) => sounds.current?.[type].play(),
    useHaptic: () => window.navigator.vibrate?.(20)
  }
}