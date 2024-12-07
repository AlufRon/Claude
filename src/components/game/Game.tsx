'use client'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => <div className="w-full h-[600px] bg-black" />
})

export default function Game() {
  return (
    <div className="w-full h-[600px] relative">
      <Suspense fallback={<div className="w-full h-[600px] bg-black" />}>
        <Scene />
      </Suspense>
    </div>
  )
}