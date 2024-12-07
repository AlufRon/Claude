'use client'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { GameUI } from '../ui/GameUI'
import { useKeyboardControls } from '../controls/useKeyboardControls'

const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => (
    <LoadingScreen />
  )
})

function LoadingScreen() {
  return (
    <div className="w-full h-screen bg-black flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <div className="text-white text-2xl">Loading Game...</div>
    </div>
  )
}

export default function Game() {
  // Initialize keyboard controls
  useKeyboardControls()

  return (
    <div className="fixed inset-0 w-full h-full bg-black">
      <Suspense fallback={<LoadingScreen />}>
        <Scene />
        <GameUI />
      </Suspense>
    </div>
  )
}
