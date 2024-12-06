'use client'

import { useEffect } from 'react'
import { useMultiplayer } from '@/hooks/useMultiplayer'
import Game from './Game'

export default function MultiplayerGame({ matchId }: { matchId: string }) {
  const { joinMatch, updatePosition } = useMultiplayer()

  useEffect(() => {
    joinMatch(matchId)
  }, [matchId])

  return <Game onPositionUpdate={updatePosition} />
}