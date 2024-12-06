import { create } from 'zustand'

interface Player {
  id: string
  name: string
  rating: number
}

interface Match {
  id: string
  player1Id?: string
  player2Id?: string
  winnerId?: string
  score?: string
}

interface TournamentStore {
  players: Player[]
  matches: Match[]
  addPlayer: (player: Omit<Player, 'id'>) => void
  startMatch: (matchId: string) => void
  updateScore: (matchId: string, score: string) => void
}

export const useTournamentStore = create<TournamentStore>((set) => ({
  players: [],
  matches: Array.from({ length: 7 }, (_, i) => ({ id: `match-${i}` })),
  addPlayer: (player) => 
    set((state) => ({
      players: [...state.players, { ...player, id: Math.random().toString() }]
    })),
  startMatch: (matchId) => {},
  updateScore: (matchId, score) => 
    set((state) => ({
      matches: state.matches.map(m => 
        m.id === matchId ? { ...m, score } : m
      )
    }))
}))