import { LevelInfoCard } from '../level-info-card'
import { SidePanel } from '../side-panel'
import { Button } from '@/components/ui/button'
import { clearSave } from '@/lib/saving'
import { ActionCards } from '../action-cards'
import { useState } from 'react'

export function GameScreen() {
  const [clickCount, setClickCount] = useState(0)

  const handleSaveDelete = () => {
    setClickCount((prev) => prev + 1)
    if (clickCount >= 4) {
      clearSave()
      setClickCount(0)
    }
  }

  const deleteButtonText = (() => {
    switch (clickCount) {
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
      <Button variant="destructive" className="fixed bottom-2" onClick={handleSaveDelete}>
        {deleteButtonText}
      </Button>
      {/* <ThemeModeToggle /> */}
    </>
  )
}
