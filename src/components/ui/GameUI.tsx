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

  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 5000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Score Display */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-12 bg-black/30 px-8 py-4 rounded-full backdrop-blur-sm">
        <div className="text-red-500 text-6xl font-bold">{player1Score}</div>
        <div className="text-white text-4xl font-bold">vs</div>
        <div className="text-blue-500 text-6xl font-bold">{player2Score}</div>
      </div>

      {/* Game Controls */}
      <div className="absolute top-8 right-8 flex flex-col gap-4 pointer-events-auto">
        {!isPlaying ? (
          <button
            onClick={() => setPlaying(true)}
            className="px-8 py-4 bg-green-500 text-white text-lg font-semibold rounded-lg hover:bg-green-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 duration-150"
          >
            Start Game
          </button>
        ) : (
          <button
            onClick={() => setPaused(!isPaused)}
            className={`px-8 py-4 ${isPaused ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white text-lg font-semibold rounded-lg transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 duration-150`}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </button>
        )}
        <button
          onClick={resetScore}
          className="px-8 py-4 bg-gray-500 text-white text-lg font-semibold rounded-lg hover:bg-gray-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 duration-150"
        >
          Reset Score
        </button>
      </div>

      {/* Controls Help */}
      {showControls && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-lg text-center bg-black/60 p-6 rounded-lg backdrop-blur-sm transition-opacity duration-500">
          <h3 className="font-bold text-xl mb-3">Controls</h3>
          <p className="mb-2">🖱️ Mouse - Orbit Camera</p>
          <p className="mb-2">⚪ Scroll - Zoom In/Out</p>
          <p>⌨️ ESC - Pause Game</p>
        </div>
      )}

      {/* Game Status */}
      {isPaused && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
          <div className="text-white text-6xl font-bold bg-black/60 px-16 py-8 rounded-2xl backdrop-blur-sm shadow-2xl">
            PAUSED
          </div>
          <div className="text-white/80 text-xl">Press ESC to resume</div>
        </div>
      )}
    </div>
  )
}