'use client'
import dynamic from 'next/dynamic'

const Scene = dynamic(() => import('./Scene'), { ssr: false })

export default function Game() {
  return (
    <div className="w-full h-[600px] relative">
      <Scene />
    </div>
  )
}