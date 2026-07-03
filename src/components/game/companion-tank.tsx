import { useUpdate } from '@/hooks/use-update'
import { Game } from '@/lib/gamestate-logic'
import { levelLabel } from '@/lib/utils'
import { PixelCreature } from './pixel-creature'

// Small "tank" wrapper for the pixel companion: a rounded dark radial-bg
// container with the inset blue glow from the design tokens, plus a tiny
// COMPANION label and the creature name + generation line.
export function CompanionTank() {
  const currentLevel = useUpdate(() => Game.currentLevelName)
  const generation = useUpdate(() => Game.state.generation)

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="font-pixel text-[9px] text-muted-foreground">Companion</div>
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-2xl"
        style={{
          width: 160,
          height: 160,
          background: 'radial-gradient(circle at 50% 45%, #10151f 0%, #08080a 70%)',
          boxShadow: 'inset 0 0 24px rgba(59,130,246,.16), inset 0 0 0 3px rgba(59,130,246,.12)',
        }}
      >
        <PixelCreature kind={currentLevel} size={132} />
      </div>
      <div className="flex items-baseline gap-2 text-sm">
        <span className="text-secondary-foreground">{levelLabel(currentLevel)}</span>
        <span className="text-muted-foreground">Gen {generation}</span>
      </div>
    </div>
  )
}
