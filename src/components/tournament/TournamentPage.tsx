'use client'

import TournamentBracket from './TournamentBracket'
import PlayerList from './PlayerList'
import { useTournamentStore } from '@/hooks/useTournamentStore'

export default function TournamentPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-3 gap-8">
        <PlayerList />
        <div className="col-span-2">
          <TournamentBracket />
        </div>
      </div>
    </div>
  )
}