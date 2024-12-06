import Game from './Game'
import { A11yAnnouncer } from '../ui/A11yAnnouncer'

export function AccessibleGame() {
  return (
    <div 
      role="application"
      aria-label="Ping Pong Game"
      tabIndex={0}
    >
      <div className="sr-only">
        Use W/S to move left paddle, Up/Down arrows to move right paddle
      </div>
      <Game />
      <A11yAnnouncer />
    </div>
  )
}