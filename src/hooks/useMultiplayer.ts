import { useEffect } from 'react'
import { socket } from '@/lib/socket'
import { useGameStore } from './useGameStore'
import { useMatchStore } from './useMatchStore'

export function useMultiplayer() {
  const updateGameState = useGameStore(state => state.updateGameState)
  const { currentMatch } = useMatchStore()

  useEffect(() => {
    socket.on('gameState', updateGameState)
    socket.on('matchUpdate', (data) => {
      if (currentMatch?.id === data.matchId) {
        useMatchStore.getState().updateMatch(data)
      }
    })

    return () => {
      socket.off('gameState')
      socket.off('matchUpdate')
    }
  }, [currentMatch])

  return {
    joinMatch: (matchId: string) => socket.emit('joinMatch', { matchId }),
    updatePosition: (position: any) => socket.emit('updatePosition', position),
    sendMatchUpdate: (update: any) => socket.emit('matchUpdate', update)
  }
}