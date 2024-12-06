'use client'
import { motion } from 'framer-motion'

export function AnimatedScore({ score }: { score: number }) {
  return (
    <motion.div
      key={score}
      initial={{ scale: 1.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="text-4xl font-bold text-white"
    >
      {score}
    </motion.div>
  )
}