'use client'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { GameUI } from '../ui/GameUI'
import { BallControls } from '../ui/BallControls'
import { useKeyboardControls } from '../controls/useKeyboardControls'

const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => <LoadingScreen />
})

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
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      <Suspense fallback={<LoadingScreen />}>
        <Scene />
        <GameUI />
        <BallControls />
      </Suspense>
    </div>
  )
}