'use client'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'

export function HitEffect({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>()
  const sparklesRef = useRef<THREE.Points>()
  
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.scale.multiplyScalar(0.95)
    }
  })

  return (
    <group ref={ref} position={position}>
      <Sparkles 
        ref={sparklesRef}
        count={20}
        scale={0.2}
        size={2}
        speed={0.3}
        color="#ffffff"
      />
    </group>
  )
}