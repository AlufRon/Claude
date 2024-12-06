const gameStore = create<GameStore>((set) => ({
  onHit: () => {
    const { playSound, useHaptic } = useSound()
    playSound('hit')
    useHaptic()
  },
  onScore: () => {
    const { playSound, useHaptic } = useSound()
    playSound('score')
    useHaptic()
  },
  onWin: () => {
    const { playSound, useHaptic } = useSound()
    playSound('win')
    window.navigator.vibrate?.(200)
  }
}))