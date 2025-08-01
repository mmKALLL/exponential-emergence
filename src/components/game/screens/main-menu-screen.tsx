import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Game } from '@/lib/gamestate-logic'
import type { JSX } from 'react'

export function MainMenuScreen(): JSX.Element {
  return (
    <Card className="main-container flex flex-col items-center p-4 gap-4 mt-8">
      <h1 className="text-3xl font-bold mb-4">Exponential Emergence</h1>
      <div className="grid grid-cols-[1.5rem_1fr] mb-4">
        <div>1.</div>
        <div>Live as an amoeba for 60 seconds. </div>
        <div>2.</div>
        <div>Gain permanent bonuses based on what you did.</div>
        <div>3.</div>
        <div>Finish goals to reach the pinnacle of evolution.</div>
      </div>

      <Button size="lg" onClick={() => Game.startGame()}>
        Start Game
      </Button>
    </Card>
  )
}
