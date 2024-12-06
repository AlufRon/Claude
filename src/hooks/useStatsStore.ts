import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PlayerStats {
  matchesPlayed: number
  matchesWon: number
  totalPoints: number
  tournamentsWon: number
  highestScore: number
  longestRally: number
}

interface StatsStore {
  stats: Record<string, PlayerStats>
  updateStats: (playerId: string, updates: Partial<PlayerStats>) => void
}

export const useStatsStore = create(persist<StatsStore>(
  (set) => ({
    stats: {},
    updateStats: (playerId, updates) => set(state => ({
      stats: {
        ...state.stats,
        [playerId]: {
          ...(state.stats[playerId] || defaultStats),
          ...updates
        }
      }
    }))
  }),
  { name: 'player-stats' }
))