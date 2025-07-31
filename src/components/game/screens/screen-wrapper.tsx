import type { JSX } from 'react'
import { GameScreen } from './game-screen'
import { useGameState } from '@/lib/gamestate-hooks'
import { assertNever } from '@/lib/utils'
import { MainMenuScreen } from './main-menu-screen'
import { RebirthScreen } from './rebirth-screen'

export function ScreenWrapper(): JSX.Element {
  const { gs } = useGameState()
  return (
    <div className="main-container flex flex-col items-center p-4 gap-4">
      {gs.currentScreen === 'main-menu' ? (
        <MainMenuScreen />
      ) : gs.currentScreen === 'in-game' ? (
        <GameScreen />
      ) : gs.currentScreen === 'rebirth' ? (
        <RebirthScreen />
      ) : (
        assertNever(gs.currentScreen)
      )}
    </div>
  )
}
