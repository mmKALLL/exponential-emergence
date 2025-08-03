import { Button } from '@/components/ui/button'
import { useUpdate } from '@/hooks/use-update'
import { Game } from '@/lib/gamestate-logic'
import type { JSX } from 'react'

export function VictoryScreen(): JSX.Element {
  const generation = useUpdate(() => Game.state.generation)

  return (
    <div className="main-container flex flex-col items-center pt-16 p-4 gap-4">
      <h1
        className="text-3xl font-bold font-serif
            bg-gradient-to-r bg-clip-text  text-transparent 
            from-cyan-400 via-green-400 to-orange-400
            animate-text-gradient
      "
      >
        YOU ARE THE MASTER OF EMERGENCE
      </h1>
      <div className="text-lg mb-8 mt-7 flex flex-col items-center gap-2">
        <div>Congratulations on completing the game! </div>
        <div>You managed to overcome the limits of evolution in {generation} generations.</div>
      </div>
      <Button variant="outline" className="w-80 select-none" size="lg" onClick={() => Game.rebirth('crustacean')}>
        Continue playing
      </Button>
    </div>
  )
}
