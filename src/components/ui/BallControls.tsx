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
    <Card className="fixed top-4 right-4 w-80 bg-white/90 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle>Ball Physics Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Speed</Label>
            <span className="text-sm text-gray-500">{ballParams.speed.toFixed(1)}</span>
          </div>
          <Slider
            value={[ballParams.speed]}
            min={0.5}
            max={4.0}
            step={0.1}
            onValueChange={([value]) => updateBallParams({ ...ballParams, speed: value })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Bounce Height</Label>
            <span className="text-sm text-gray-500">{ballParams.bounceHeight.toFixed(1)}</span>
          </div>
          <Slider
            value={[ballParams.bounceHeight]}
            min={0.5}
            max={4.0}
            step={0.1}
            onValueChange={([value]) => updateBallParams({ ...ballParams, bounceHeight: value })}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label>Gravity</Label>
            <span className="text-sm text-gray-500">{ballParams.gravity.toFixed(1)}</span>
          </div>
          <Slider
            value={[ballParams.gravity]}
            min={0.3}
            max={1.5}
            step={0.1}
            onValueChange={([value]) => updateBallParams({ ...ballParams, gravity: value })}
          />
        </div>
      </CardContent>
    </Card>
  )
}