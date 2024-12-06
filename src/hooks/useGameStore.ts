import { create } from 'zustand'

interface GameStore {
  paddleA: { x: number; y: number; z: number }
  paddleB: { x: number; y: number; z: number }
  ball: { x: number; y: number; z: number; vx: number; vy: number; vz: number }
  scoreA: number
  scoreB: number
  updatePaddleA: (position: { x: number; y: number; z: number }) => void
  updatePaddleB: (position: { x: number; y: number; z: number }) => void
  updateBall: (position: { x: number; y: number; z: number }, velocity: { vx: number; vy: number; vz: number }) => void
  incrementScore: (player: 'A' | 'B') => void
  resetGame: () => void
}

export const useGameStore = create<GameStore>((set) => ({
  paddleA: { x: -1, y: 0.1, z: 0 },
  paddleB: { x: 1, y: 0.1, z: 0 },
  ball: { x: 0, y: 0.1, z: 0, vx: 0.1, vy: 0, vz: 0 },
  scoreA: 0,
  scoreB: 0,
  updatePaddleA: (position) => set({ paddleA: position }),
  updatePaddleB: (position) => set({ paddleB: position }),
  updateBall: (position, velocity) => set({ ball: { ...position, ...velocity } }),
  incrementScore: (player) => set((state) => ({
    [player === 'A' ? 'scoreA' : 'scoreB']: state[player === 'A' ? 'scoreA' : 'scoreB'] + 1
  })),
  resetGame: () => set({
    ball: { x: 0, y: 0.1, z: 0, vx: 0.1, vy: 0, vz: 0 },
    paddleA: { x: -1, y: 0.1, z: 0 },
    paddleB: { x: 1, y: 0.1, z: 0 }
  })
}))