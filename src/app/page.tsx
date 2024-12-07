import Game from '@/components/game/Game'

export default function Home() {
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden">
      <Game />
    </div>
  )
}