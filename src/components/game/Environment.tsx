'use client'
import { useRef } from 'react'
import * as THREE from 'three'
import { Rock, Flower, TableProps } from './Props'

// Previous tree and ground code remains the same...

function ScatteredProps() {
  const props = []
  
  // Add rocks
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = 10 + Math.random() * 15
    const pos = [
      Math.cos(angle) * radius,
      -1.8 + Math.random() * 0.2, // Slightly varied heights
      Math.sin(angle) * radius
    ]
    props.push(
      <Rock 
        key={`rock-${i}`}
        position={pos}
        scale={0.3 + Math.random() * 0.7}
      />
    )
  }

  // Add flower patches
  for (let i = 0; i < 50; i++) {
    const angle = Math.random() * Math.PI * 2
    const radius = 8 + Math.random() * 20
    const pos = [
      Math.cos(angle) * radius,
      -1.9,
      Math.sin(angle) * radius
    ]
    
    // Add cluster of flowers
    if (Math.random() > 0.7) {
      for (let j = 0; j < 3; j++) {
        const offset = [
          pos[0] + (Math.random() - 0.5) * 0.5,
          pos[1],
          pos[2] + (Math.random() - 0.5) * 0.5
        ]
        props.push(
          <Flower 
            key={`flower-${i}-${j}`}
            position={offset}
          />
        )
      }
    } else {
      props.push(
        <Flower 
          key={`flower-${i}`}
          position={pos}
        />
      )
    }
  }

  return <group>{props}</group>
}

export function Room() {
  return (
    <group>
      {/* Previous lighting setup remains the same... */}
      
      {/* Ground with terrain remains the same... */}
      
      {/* Add scattered props */}
      <ScatteredProps />
      
      {/* Add table props */}
      <TableProps />
      
      {/* Trees remain the same... */}
    </group>
  )
}