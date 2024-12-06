'use client'

import { Button } from '@/components/ui/button'
import { useTournamentStore } from '@/hooks/useTournamentStore'

export default function TournamentControls() {
  const { players, startTournament, getTournamentStatus } = useTournamentStore()
  const status = getTournamentStatus()

  return (
    <div className="mb-8 flex justify-between items-center">
      <div className="text-white">
        {status === 'not_started' && (
          <span>{8 - players.length} more players needed to start</span>
        )}
        {status === 'in_progress' && (
          <span>Tournament in progress</span>
        )}
        {status === 'completed' && (
          <span>Tournament completed</span>
        )}
      </div>
      
      {status === 'not_started' && players.length >= 8 && (
        <Button onClick={startTournament}>
          Start Tournament
        </Button>
      )}
    </div>
  )
}