import { useTournamentStore } from '@/hooks/useTournamentStore'

export default function TournamentHistory() {
  const { matches } = useTournamentStore()
  const completedMatches = matches.filter(m => m.winnerId)
  
  return (
    <div className="bg-slate-900 rounded-lg p-6">
      <h2 className="text-xl text-white font-bold mb-4">Match History</h2>
      <div className="space-y-3">
        {completedMatches.map(match => (
          <div key={match.id} className="bg-slate-800 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="text-white">
                {match.player1Id} vs {match.player2Id}
              </div>
              <div className="text-white/60">{match.score}</div>
            </div>
            <div className="text-sm text-green-400 mt-1">
              Winner: {match.winnerId}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}