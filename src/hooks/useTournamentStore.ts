import { create } from 'zustand'

interface TournamentStore extends BaseTournamentStore {
  startTournament: () => void
  scheduleMatch: (matchId: string, player1Id: string, player2Id: string) => void
  completeMatch: (matchId: string, winnerId: string, score: string) => void
  getTournamentStatus: () => 'not_started' | 'in_progress' | 'completed'
}

export const useTournamentStore = create<TournamentStore>((set, get) => ({
  players: [],
  matches: Array.from({ length: 7 }, (_, i) => ({ id: `match-${i}` })),
  
  startTournament: () => {
    const { players } = get()
    if (players.length < 8) return

    // Seed first round matches
    const shuffledPlayers = [...players].sort(() => Math.random() - 0.5)
    const firstRoundMatches = get().matches.slice(0, 4)
    
    firstRoundMatches.forEach((match, i) => {
      set(state => ({
        matches: state.matches.map(m => 
          m.id === match.id 
            ? { 
                ...m, 
                player1Id: shuffledPlayers[i*2].id,
                player2Id: shuffledPlayers[i*2+1].id 
              }
            : m
        )
      }))
    })
  },

  scheduleMatch: (matchId, player1Id, player2Id) => 
    set(state => ({
      matches: state.matches.map(m =>
        m.id === matchId ? { ...m, player1Id, player2Id } : m
      )
    })),

  completeMatch: (matchId, winnerId, score) => {
    set(state => ({
      matches: state.matches.map(m =>
        m.id === matchId ? { ...m, winnerId, score } : m
      )
    }))

    const { matches } = get()
    const matchIndex = matches.findIndex(m => m.id === matchId)
    
    // Progress winner to next round
    if (matchIndex < 4) {
      const nextMatchId = matches[4 + Math.floor(matchIndex/2)].id
      const isFirstWinner = matchIndex % 2 === 0
      get().scheduleMatch(
        nextMatchId,
        isFirstWinner ? winnerId : matches[4 + Math.floor(matchIndex/2)].player1Id,
        isFirstWinner ? matches[4 + Math.floor(matchIndex/2)].player2Id : winnerId
      )
    } else if (matchIndex < 6) {
      const isFirstWinner = matchIndex === 4
      get().scheduleMatch(
        matches[6].id,
        isFirstWinner ? winnerId : matches[6].player1Id,
        isFirstWinner ? matches[6].player2Id : winnerId
      )
    }
  },

  getTournamentStatus: () => {
    const { matches } = get()
    if (!matches[0].player1Id) return 'not_started'
    if (matches[6].winnerId) return 'completed'
    return 'in_progress'
  }
}))