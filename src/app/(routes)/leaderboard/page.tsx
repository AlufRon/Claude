'use client'

import { useTournamentStore } from '@/hooks/useTournamentStore'

export default function LeaderboardPage() {
  const players = useTournamentStore(state => state.players)
  
  return (
    <main className="container mx-auto py-8">
      <div className="bg-slate-900 rounded-lg p-6">
        <h1 className="text-2xl font-bold text-white mb-6">Leaderboard</h1>
        <div className="space-y-3">
          {players
            .sort((a, b) => b.rating - a.rating)
            .map(player => (
              <div key={player.id} className="flex justify-between bg-slate-800 p-4 rounded">
                <span className="text-white font-medium">{player.name}</span>
                <span className="text-white/60">{player.rating}</span>
              </div>
            ))}
        </div>
      </div>
    </main>
  )
}