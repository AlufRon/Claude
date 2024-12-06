'use client'

import { useTournamentStore } from '@/hooks/useTournamentStore'
import { motion } from 'framer-motion'

interface BracketNode {
  id: string
  round: number
  match?: Match
  x: number
  y: number
}

export default function BracketVisualizer() {
  const matches = useTournamentStore(state => state.matches)
  const nodes = createBracketLayout(matches)

  return (
    <div className="relative w-full h-[800px] bg-slate-900 rounded-xl p-8">
      <svg className="w-full h-full">
        {/* Connect lines between matches */}
        {nodes.map(node => (
          node.round < 3 && (
            <path
              key={`${node.id}-line`}
              d={`M ${node.x + 200} ${node.y + 40} 
                  C ${node.x + 300} ${node.y + 40},
                    ${node.x + 300} ${node.y + 80},
                    ${node.x + 400} ${node.y + 80}`}
              stroke="rgba(255,255,255,0.2)"
              fill="none"
            />
          )
        ))}
      </svg>
      
      {nodes.map(node => (
        <MatchNode
          key={node.id}
          node={node}
          style={{
            position: 'absolute',
            left: node.x,
            top: node.y,
          }}
        />
      ))}
    </div>
  )
}

function MatchNode({ node, style }: { node: BracketNode, style: React.CSSProperties }) {
  const match = node.match
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-48 bg-slate-800 rounded-lg p-4 shadow-lg"
      style={style}
    >
      <div className="text-white/60 text-sm mb-2">Round {node.round}</div>
      {match ? (
        <>
          <PlayerSlot name={match.player1Id} isWinner={match.winnerId === match.player1Id} />
          <PlayerSlot name={match.player2Id} isWinner={match.winnerId === match.player2Id} />
          {match.score && (
            <div className="mt-2 text-white/60 text-sm">{match.score}</div>
          )}
        </>
      ) : (
        <div className="h-16 flex items-center justify-center text-white/40">
          TBD
        </div>
      )}
    </motion.div>
  )
}

function PlayerSlot({ name, isWinner }: { name?: string, isWinner?: boolean }) {
  return (
    <div className={`py-2 px-3 rounded ${
      isWinner ? 'bg-green-900/20 text-green-400' : 'text-white/80'
    }`}>
      {name || 'TBD'}
    </div>
  )
}

function createBracketLayout(matches: Match[]): BracketNode[] {
  const baseX = 50
  const baseY = 100
  const xGap = 300
  const yGap = 160
  
  return [
    // Quarter Finals
    ...matches.slice(0, 4).map((match, i) => ({
      id: match.id,
      round: 1,
      match,
      x: baseX,
      y: baseY + i * yGap,
    })),
    // Semi Finals
    ...matches.slice(4, 6).map((match, i) => ({
      id: match.id,
      round: 2,
      match,
      x: baseX + xGap,
      y: baseY + yGap/2 + i * yGap * 2,
    })),
    // Final
    {
      id: matches[6].id,
      round: 3,
      match: matches[6],
      x: baseX + xGap * 2,
      y: baseY + yGap * 1.5,
    },
  ]
}