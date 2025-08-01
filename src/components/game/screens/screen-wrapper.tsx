import type { JSX } from 'react'
import { GameScreen } from './game-screen'
import { assertNever } from '@/lib/utils'
import { MainMenuScreen } from './main-menu-screen'
import { RebirthScreen } from './rebirth-screen'
import { useUpdate } from '@/hooks/use-update'
import { Game } from '@/lib/gamestate-logic'

export function ScreenWrapper(): JSX.Element {
  const currentScreen = useUpdate(() => Game.state.currentScreen)
  return (
    <div className="main-container flex flex-col items-center p-4 gap-4">
      {currentScreen === 'main-menu' ? (
        <MainMenuScreen />
      ) : currentScreen === 'in-game' ? (
        <GameScreen />
      ) : currentScreen === 'rebirth' ? (
        <RebirthScreen />
      ) : (
        assertNever(currentScreen)
      )}
    </div>
  )
}
