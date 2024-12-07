'use client'

import { useGameStore } from '@/store/gameStore'
import { Card, CardHeader, CardTitle, CardContent } from './card'
import { Slider } from './slider'
import { Label } from './label'

export function BallControls() {
  const { 
    updateBallParams,
    ballParams = {
      speed: 2.0,
      bounceHeight: 2.0,
      gravity: 0.8
    }
  } = useGameStore()

  return (
    <Card className="absolute top-4 left-4 w-80 bg-black/40 backdrop-blur-sm shadow-lg border border-white/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-white text-lg font-medium">Ball Physics Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-white">Speed</Label>
            <span className="text-white/80 text-sm">{ballParams.speed.toFixed(1)}</span>
          </div>
          <Slider
            value={[ballParams.speed]}
            min={0.5}
            max={4.0}
            step={0.1}
            onValueChange={([value]) => updateBallParams({ ...ballParams, speed: value })}
            className="cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-white">Bounce Height</Label>
            <span className="text-white/80 text-sm">{ballParams.bounceHeight.toFixed(1)}</span>
          </div>
          <Slider
            value={[ballParams.bounceHeight]}
            min={0.5}
            max={4.0}
            step={0.1}
            onValueChange={([value]) => updateBallParams({ ...ballParams, bounceHeight: value })}
            className="cursor-pointer"
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label className="text-white">Gravity</Label>
            <span className="text-white/80 text-sm">{ballParams.gravity.toFixed(1)}</span>
          </div>
          <Slider
            value={[ballParams.gravity]}
            min={0.3}
            max={1.5}
            step={0.1}
            onValueChange={([value]) => updateBallParams({ ...ballParams, gravity: value })}
            className="cursor-pointer"
          />
        </div>
      </CardContent>
    </Card>
  )
}