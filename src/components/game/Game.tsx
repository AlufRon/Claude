'use client'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { GameUI } from '../ui/GameUI'

const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="text-white text-2xl">Loading Game...</div>
    </div>
  )
})

export default function Game() {
  return (
    <div className="fixed inset-0 w-full h-full">
      <Suspense
        fallback={
          <div className="w-full h-screen bg-black flex items-center justify-center">
            <div className="text-white text-2xl">Loading Game...</div>
          </div>
        }
      >
        <Scene />
        <GameUI />
      </Suspense>
    </div>
  )
}
