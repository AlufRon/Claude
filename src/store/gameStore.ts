import { create } from 'zustand'

type GameState = {
  player1Score: number
  player2Score: number
  isPlaying: boolean
  isPaused: boolean
  ballPosition: { x: number; y: number; z: number }
  ballVelocity: { x: number; y: number; z: number }
  ballParams: {
    speed: number
    bounceHeight: number
    gravity: number
  }
  paddle1Position: { x: number; y: number; z: number }
  paddle2Position: { x: number; y: number; z: number }
  incrementScore: (player: 1 | 2) => void
  resetScore: () => void
  setPlaying: (playing: boolean) => void
  setPaused: (paused: boolean) => void
  updateBallState: (position: { x: number; y: number; z: number }, velocity: { x: number; y: number; z: number }) => void
  updateBallParams: (params: { speed: number; bounceHeight: number; gravity: number }) => void
  updatePaddlePosition: (player: 1 | 2, position: { x: number; y: number; z: number }) => void
}

export const useGameStore = create<GameState>((set) => ({
  player1Score: 0,
  player2Score: 0,
  isPlaying: true, // Set to true by default
  isPaused: false,
  ballPosition: { x: 0, y: 0.1, z: 0 },
  ballVelocity: { x: 0, y: 0, z: 0 },
  ballParams: {
    speed: 2.0,
    bounceHeight: 2.0,
    gravity: 0.8
  },
  paddle1Position: { x: -1, y: 0.1, z: 0 },
  paddle2Position: { x: 1, y: 0.1, z: 0 },

  incrementScore: (player) => 
    set((state) => ({
      ...state,
      player1Score: player === 1 ? state.player1Score + 1 : state.player1Score,
      player2Score: player === 2 ? state.player2Score + 1 : state.player2Score,
    })),

  resetScore: () => 
    set((state) => ({ ...state, player1Score: 0, player2Score: 0 })),

  setPlaying: (playing) => 
    set((state) => ({ ...state, isPlaying: playing })),

  setPaused: (paused) => 
    set((state) => ({ ...state, isPaused: paused })),

  updateBallState: (position, velocity) => 
    set((state) => ({ ...state, ballPosition: position, ballVelocity: velocity })),

  updateBallParams: (params) =>
    set((state) => ({ ...state, ballParams: params })),

  updatePaddlePosition: (player, position) => 
    set((state) => ({
      ...state,
      paddle1Position: player === 1 ? position : state.paddle1Position,
      paddle2Position: player === 2 ? position : state.paddle2Position,
    })),
}))