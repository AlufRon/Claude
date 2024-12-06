interface LiveMatch {
  id: string
  players: [string, string]
  scores: [number, number]
  stats: {
    rallies: number
    longestRally: number
    avgRallyLength: number
  }
}

export default function LiveStats({ match }: { match: LiveMatch }) {
  return (
    <div className="mt-4 bg-slate-900 p-4 rounded-lg">
      <div className="grid grid-cols-3 gap-4">
        <StatCard 
          label="Current Rally"
          value={match.stats.rallies}
          icon="🏓"
        />
        <StatCard 
          label="Longest Rally"
          value={match.stats.longestRally}
          icon="🔥"
        />
        <StatCard 
          label="Avg Rally Length"
          value={match.stats.avgRallyLength.toFixed(1)}
          icon="📊"
        />
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string, value: number | string, icon: string }) {
  return (
    <div className="bg-slate-800 p-4 rounded-lg">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-white/60 text-sm">{label}</div>
      <div className="text-white text-2xl font-bold">{value}</div>
    </div>
  )
}