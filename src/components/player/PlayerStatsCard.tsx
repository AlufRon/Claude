import { Card } from '@/components/ui/card'
import { useStatsStore } from '@/hooks/useStatsStore'

export default function PlayerStatsCard({ playerId }: { playerId: string }) {
  const stats = useStatsStore(state => state.stats[playerId] || defaultStats)
  
  return (
    <Card className="bg-slate-800 p-4">
      <div className="grid grid-cols-2 gap-4">
        <StatItem label="Matches" value={stats.matchesPlayed} />
        <StatItem label="Win Rate" value={`${Math.round(stats.matchesWon/stats.matchesPlayed*100 || 0)}%`} />
        <StatItem label="High Score" value={stats.highestScore} />
        <StatItem label="Tournaments Won" value={stats.tournamentsWon} />
      </div>
    </Card>
  )
}

function StatItem({ label, value }: { label: string, value: string | number }) {
  return (
    <div>
      <div className="text-sm text-white/60">{label}</div>
      <div className="text-xl font-bold text-white">{value}</div>
    </div>
  )
}