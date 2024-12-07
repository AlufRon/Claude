'use client'

import { useState, useEffect } from 'react'
import { useGameStore } from '@/store/gameStore'

export function GameUI() {
  const {
    player1Score,
    player2Score,
    isPlaying,
    isPaused,
    setPlaying,
    setPaused,
    resetScore
  } = useGameStore()

  const [showControls, setShowControls] = useState(true)

  // Hide controls after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Score Display */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-8">
        <div className="text-red-500 text-6xl font-bold shadow-lg">{player1Score}</div>
        <div className="text-white text-4xl font-bold">vs</div>
        <div className="text-blue-500 text-6xl font-bold shadow-lg">{player2Score}</div>
      </div>

      {/* Game Controls */}
      <div className="absolute top-8 right-8 flex flex-col gap-4 pointer-events-auto">
        {!isPlaying ? (
          <button
            onClick={() => setPlaying(true)}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Start Game
          </button>
        ) : (
          <button
            onClick={() => setPaused(!isPaused)}
            className={`px-6 py-3 ${isPaused ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white rounded-lg transition-colors`}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
        <button
          onClick={resetScore}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Reset Score
        </button>
      </div>

      {/* Controls Help */}
      {showControls && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-lg text-center bg-black/60 p-6 rounded-lg backdrop-blur-sm">
          <h3 className="font-bold mb-2">Controls</h3>
          <p className="mb-1">Mouse - Orbit Camera</p>
          <p className="mb-1">Scroll - Zoom In/Out</p>
          <p>ESC - Pause Game</p>
        </div>
      )}

      {/* Game Status */}
      {isPaused && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-4xl font-bold bg-black/60 px-12 py-6 rounded-lg backdrop-blur-sm">
          PAUSED
        </div>
      )}
    </div>
  )
}
