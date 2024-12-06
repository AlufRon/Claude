'use client'
import { motion } from 'framer-motion'
import { AnimatedScore } from './AnimatedScore'

export function MatchCard({ match }: { match: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      className="bg-slate-800 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow"
    >
      <div className="text-lg font-semibold text-white mb-2">
        {match.player1} vs {match.player2}
      </div>
      <div className="flex justify-between items-center">
        <AnimatedScore score={match.score1} />
        <div className="text-2xl text-white/50">-</div>
        <AnimatedScore score={match.score2} />
      </div>
    </motion.div>
  )
}