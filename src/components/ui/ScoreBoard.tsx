import { useGameStore } from '@/hooks/useGameStore'

export default function ScoreBoard() {
  const { scoreA, scoreB } = useGameStore()
  
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 px-6 py-3 rounded-lg text-white font-bold text-2xl">
      {scoreA} - {scoreB}
    </div>
  )
}