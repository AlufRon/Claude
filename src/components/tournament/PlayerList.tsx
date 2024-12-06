'use client'

import { useState } from 'react'
import { useTournamentStore } from '@/hooks/useTournamentStore'

export default function PlayerList() {
  const [newPlayer, setNewPlayer] = useState({ name: '', rating: 1500 })
  const { players, addPlayer } = useTournamentStore()

  return (
    <div className="bg-slate-900 rounded-lg p-6 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4">Players</h2>
      
      <div className="space-y-2 mb-6">
        {players.map(player => (
          <div key={player.id} className="flex justify-between bg-slate-800 p-3 rounded">
            <span className="text-white">{player.name}</span>
            <span className="text-white/60">{player.rating}</span>
          </div>
        ))}
      </div>

      <form 
        onSubmit={e => {
          e.preventDefault()
          addPlayer(newPlayer)
          setNewPlayer({ name: '', rating: 1500 })
        }}
        className="space-y-4"
      >
        <input
          type="text"
          placeholder="Player name"
          value={newPlayer.name}
          onChange={e => setNewPlayer({ ...newPlayer, name: e.target.value })}
          className="w-full bg-slate-800 text-white p-2 rounded"
        />
        <button 
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Add Player
        </button>
      </form>
    </div>
  )
}