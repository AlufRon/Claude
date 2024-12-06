import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="bg-slate-900 border-b border-slate-800">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-white font-bold text-xl">
            PingPong Tournament
          </Link>
          <div className="flex gap-6">
            <Link href="/play" className="text-slate-300 hover:text-white">
              Play
            </Link>
            <Link href="/tournament" className="text-slate-300 hover:text-white">
              Tournament
            </Link>
            <Link href="/leaderboard" className="text-slate-300 hover:text-white">
              Leaderboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}