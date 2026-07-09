import { LevelInfoCard } from '../level-info-card'
import { SidePanel } from '../side-panel'
import { Button } from '@/components/ui/button'
import { clearSave } from '@/lib/saving'
import { ActionCards } from '../action-cards'
import { useEffect, useState } from 'react'
import { Game } from '@/lib/gamestate-logic'
import { useUpdate } from '@/hooks/use-update'

export function GameScreen() {
  const [deleteClickCount, setDeleteClickCount] = useState(0)
  const [resetClickCount, setResetClickCount] = useState(0)

  const noMoreGoals = useUpdate(() => Game.currentGoal === null)
  const currentLevel = useUpdate(() => Game.currentLevelName)
  const alreadyCleared = useUpdate(() => Game.hasClearedLevel(Game.currentLevelName))
  const [showComplete, setShowComplete] = useState(false)

  // Latch the Complete-level state on the FIRST clear of this level. Once latched it
  // stays for the run (marking cleared won't hide it), and it pauses + blocks input.
  useEffect(() => {
    if (noMoreGoals && !alreadyCleared && !showComplete) {
      setShowComplete(true)
      Game.markLevelCleared(currentLevel) // persist (idempotent)
      Game.state.currentActionName = null // pause the run
      Game.setLevelCompleteOpen(true) // block hotkeys/space
    }
  }, [noMoreGoals, alreadyCleared, currentLevel, showComplete])

  // Clear the input-block flag if this screen unmounts (e.g. run ends).
  useEffect(() => () => Game.setLevelCompleteOpen(false), [])

  const handleCompleteLevel = () => {
    Game.setLevelCompleteOpen(false)
    Game.resetRun() // ends the run -> rebirth screen (currentScreen becomes 'rebirth')
  }

  const handleSaveDelete = () => {
    if (deleteClickCount >= 4) {
      setDeleteClickCount(0)
      clearSave()
    }

    setDeleteClickCount((prev) => prev + 1)
  }

  const deleteButtonText = (() => {
    switch (deleteClickCount) {
      case 0:
        return 'Delete save'
      case 1:
        return 'Are you sure?'
      case 2:
        return 'Really sure?'
      case 3:
        return 'Last chance!'
      case 4:
        return 'Clicking now will delete your save!'
      default:
        return '???'
    }
  })()

  const handleResetRun = () => {
    setResetClickCount((prev) => prev + 1)
    if (resetClickCount >= 1) {
      Game.resetRun()
      setResetClickCount(0)
    }
  }
  const resetButtonText = (() => {
    switch (resetClickCount) {
      case 0:
        return 'Reset life'
      case 1:
        return 'Are you sure?'
      default:
        return '???'
    }
  })()

  return (
    <>
      <div className="grid grid-cols-[3fr_1fr]">
        <div className="flex flex-col items-center p-4 gap-4">
          <LevelInfoCard />
          {showComplete ? (
            <div className="flex flex-col items-center gap-6 p-8">
              <Button
                variant="outline"
                size="lg"
                className="px-10 py-7 text-xl font-bold text-green-500 hover:bg-green-500 hover:text-black active:bg-green-500 active:text-black"
                onClick={handleCompleteLevel}
              >
                Complete level
              </Button>
            </div>
          ) : (
            <ActionCards />
          )}
        </div>
        <div className="flex flex-col items-center p-4 gap-4">
          <SidePanel />
        </div>
      </div>

      <div className="fixed bottom-2 flex gap-4">
        <Button className="align-self-end" onClick={handleResetRun}>
          {resetButtonText}
        </Button>
        <Button variant="destructive" onClick={handleSaveDelete}>
          {deleteButtonText}
        </Button>
      </div>
      {/* <ThemeModeToggle /> */}
    </>
  )
}
