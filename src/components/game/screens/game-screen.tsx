import { LevelInfoCard } from '../level-info-card'
import { SidePanel } from '../side-panel'
import { Button } from '@/components/ui/button'
import { clearSave } from '@/lib/saving'
import { ActionCards } from '../action-cards'
import { useState } from 'react'
import { Game } from '@/lib/gamestate-logic'

export function GameScreen() {
  const [deleteClickCount, setDeleteClickCount] = useState(0)
  const [resetClickCount, setResetClickCount] = useState(0)

  const handleSaveDelete = () => {
    setDeleteClickCount((prev) => prev + 1)
    if (deleteClickCount >= 4) {
      clearSave()
      setDeleteClickCount(0)
    }
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
          <ActionCards />
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
