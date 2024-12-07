'use client'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => <div className="w-full h-screen bg-black" />
})

export default function Game() {
  return (
    <div className="w-full h-screen relative">
      <Suspense fallback={<div className="w-full h-screen bg-black" />}>
        <Scene />
      </Suspense>
    </div>
  )
}