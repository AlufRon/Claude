'use client'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { GameUI } from '../ui/GameUI'
import { BallControls } from '../ui/BallControls'
import { useKeyboardControls } from '../controls/useKeyboardControls'

const Scene = dynamic(
  () => import('./Scene').then(mod => mod.default),
  { 
    ssr: false,
    loading: () => <LoadingScreen />
  }
)

function LoadingScreen() {
  return (
    <div className="fixed inset-0 w-screen h-screen bg-black flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <div className="text-white text-2xl font-semibold">Loading Game...</div>
    </div>
  )
}

export default function Game() {
  useKeyboardControls()

  return (
    <div className="relative w-screen h-screen">
      <Suspense fallback={<LoadingScreen />}>
        <Scene />
      </Suspense>
      <div className="absolute inset-0 pointer-events-none">
        <div className="pointer-events-auto">
          <GameUI />
          <BallControls />
        </div>
      </div>
    </div>
  )
}