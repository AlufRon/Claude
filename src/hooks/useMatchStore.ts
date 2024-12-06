import { create } from 'zustand'

interface MatchStore {
  currentMatch?: {
    id: string
    player1: string
    player2: string
    scores: [number, number]
    startTime: number
  }
  startMatch: (player1: string, player2: string) => void
  updateScore: (playerIndex: 0 | 1) => void
  endMatch: () => void
}

export const useMatchStore = create<MatchStore>((set) => ({
  startMatch: (player1, player2) => set({
    currentMatch: {
      id: Math.random().toString(),
      player1,
      player2,
      scores: [0, 0],
      startTime: Date.now(),
    }
  }),
  
  updateScore: (playerIndex) => set((state) => {
    if (!state.currentMatch) return state
    const newScores = [...state.currentMatch.scores]
    newScores[playerIndex]++
    return {
      currentMatch: {
        ...state.currentMatch,
        scores: newScores as [number, number]
      }
    }
  }),
  
  endMatch: () => set({ currentMatch: undefined })
}))