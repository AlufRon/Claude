'use client'
import { useEffect, useState } from 'react'
import { socket } from '@/lib/socket'
import SpectatorView from '../game/SpectatorView'
import LiveStats from './LiveStats'

interface LiveMatch {
  id: string
  players: [string, string]
  scores: [number, number]
  stats: {
    rallies: number
    longestRally: number
    avgRallyLength: number
  }
}

export default function LiveTournament() {
  const [activeMatches, setActiveMatches] = useState<LiveMatch[]>([])
  const [selectedMatch, setSelectedMatch] = useState<string>()

  useEffect(() => {
    socket.on('tournamentUpdate', setActiveMatches)
    return () => { socket.off('tournamentUpdate') }
  }, [])

  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="col-span-1 bg-slate-900 p-4 rounded-lg">
        <h2 className="text-xl text-white mb-4">Live Matches</h2>
        <div className="space-y-2">
          {activeMatches.map(match => (
            <button
              key={match.id}
              onClick={() => setSelectedMatch(match.id)}
              className={`w-full p-3 rounded ${
                selectedMatch === match.id 
                  ? 'bg-blue-600' 
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            >
              <div className="text-white">{match.players[0]} vs {match.players[1]}</div>
              <div className="text-white/60 text-sm mt-1">
                {match.scores[0]} - {match.scores[1]}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="col-span-3">
        {selectedMatch ? (
          <>
            <SpectatorView matchId={selectedMatch} />
            <LiveStats match={activeMatches.find(m => m.id === selectedMatch)!} />
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-white/60">
            Select a match to spectate
          </div>
        )}
      </div>
    </div>
  )
}