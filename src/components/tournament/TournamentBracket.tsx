'use client'

import { useTournamentStore } from '@/hooks/useTournamentStore'

export default function TournamentBracket() {
  const matches = useTournamentStore((state) => state.matches)

  return (
    <div className="relative h-[600px] p-8 bg-slate-900 rounded-lg shadow-xl">
      {/* Quarter Finals */}
      {matches.slice(0, 4).map((match, i) => (
        <MatchBox 
          key={match.id}
          match={match}
          style={{
            position: 'absolute',
            left: '5%',
            top: `${15 + i * 25}%`
          }}
        />
      ))}

      {/* Semi Finals */}
      {matches.slice(4, 6).map((match, i) => (
        <MatchBox
          key={match.id} 
          match={match}
          style={{
            position: 'absolute',
            left: '40%',
            top: `${25 + i * 35}%`
          }}
        />
      ))}

      {/* Final */}
      <MatchBox
        match={matches[6]}
        style={{
          position: 'absolute',
          left: '70%',
          top: '42%'
        }}
      />
    </div>
  )
}

function MatchBox({ match, style }: { match: Match, style: React.CSSProperties }) {
  return (
    <div 
      className="w-48 h-24 bg-slate-800 rounded p-3 shadow-lg"
      style={style}
    >
      <div className="text-white/80 text-sm mb-2">Match {match.id}</div>
      <div className="text-white font-medium">
        {match.player1Id || 'TBD'} vs {match.player2Id || 'TBD'}
      </div>
      {match.score && (
        <div className="text-white/60 mt-2">{match.score}</div>
      )}
    </div>
  )
}