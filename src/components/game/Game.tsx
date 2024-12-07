'use client'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-[#1c1c1c] flex items-center justify-center">
      <div className="text-white text-2xl">Loading...</div>
    </div>
  )
})

export default function Game() {
  return (
    <div className="fixed inset-0 w-full h-full">
      <Suspense 
        fallback={
          <div className="w-full h-screen bg-[#1c1c1c] flex items-center justify-center">
            <div className="text-white text-2xl">Loading...</div>
          </div>
        }
      >
        <Scene />
      </Suspense>
    </div>
  )
}