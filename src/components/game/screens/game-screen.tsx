import { LevelInfoCard } from '../level-info-card'
import { SidePanel } from '../side-panel'
import { Button } from '@/components/ui/button'
import { clearSave } from '@/lib/saving'
import { ActionCards } from '../action-cards'

export function GameScreen() {
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
      <Button variant="destructive" className="fixed bottom-4" onClick={() => clearSave()}>
        Delete save
      </Button>
      {/* <ThemeModeToggle /> */}
    </>
  )
}
