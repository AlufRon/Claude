'use client'

import { useMatchStore } from '@/hooks/useMatchStore'
import { Button } from '@/components/ui/button'

export default function MatchOverlay() {
  const match = useMatchStore(state => state.currentMatch)
  const { updateScore, endMatch } = useMatchStore()
  
  if (!match) return null
  
  const [score1, score2] = match.scores
  const winner = score1 >= 11 ? match.player1 : score2 >= 11 ? match.player2 : null
  
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
      <div className="bg-slate-900 p-6 rounded-lg shadow-xl">
        {winner ? (
          <>
            <h2 className="text-2xl font-bold text-white mb-4">
              {winner} Wins!
            </h2>
            <div className="text-xl text-white mb-6">
              Final Score: {score1} - {score2}
            </div>
            <Button onClick={endMatch}>New Game</Button>
          </>
        ) : (
          <>
            <div className="text-xl text-white mb-6">
              {match.player1} vs {match.player2}
            </div>
            <div className="flex justify-center gap-12 text-3xl font-bold text-white mb-8">
              <span>{score1}</span>
              <span>-</span>
              <span>{score2}</span>
            </div>
            <div className="flex gap-4">
              <Button onClick={() => updateScore(0)}>
                Point for {match.player1}
              </Button>
              <Button onClick={() => updateScore(1)}>
                Point for {match.player2}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}