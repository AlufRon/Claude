'use client'

import { useEffect, useRef } from 'react'

export function A11yAnnouncer() {
  const ref = useRef<HTMLDivElement>(null)

  const announce = (message: string) => {
    if (ref.current) {
      ref.current.textContent = message
    }
  }

  return (
    <div 
      ref={ref}
      role="status"
      aria-live="polite"
      className="sr-only"
    />
  )
}