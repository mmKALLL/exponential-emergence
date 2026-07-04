import { useState, type JSX } from 'react'
import { createPortal } from 'react-dom'
import { tutorialMessages } from '@/lib/data/tutorial-definitions'
import { Game } from '@/lib/gamestate-logic'
import { useUpdate } from '@/hooks/use-update'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function HelpPanel(): JSX.Element | null {
  const [open, setOpen] = useState(false)
  const inGame = useUpdate(() => Game.state.currentScreen === 'in-game')
  const seenIds = useUpdate(() => [...Game.state.seenTutorials])

  if (!inGame) return null

  const seenMessages = tutorialMessages.filter((m) => seenIds.includes(m.id))

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-2 left-2 z-[150] rounded-full"
        aria-label="Help"
        onClick={() => setOpen(true)}
      >
        ?
      </Button>
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[190] flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <Card className="mx-4 flex max-h-[70vh] w-full max-w-lg flex-col">
              <CardHeader>
                <CardTitle>Help</CardTitle>
              </CardHeader>
              <CardContent className="flex min-h-0 flex-col gap-4">
                <div className="flex min-h-0 flex-col gap-3 overflow-y-auto">
                  {seenMessages.length === 0 ? (
                    <p className="text-sm text-muted-foreground">You haven't encountered any tips yet.</p>
                  ) : (
                    seenMessages.map((m) => (
                      <div key={m.id} className="flex flex-col gap-1">
                        <p className="text-sm font-bold">{m.title}</p>
                        <p className="text-sm text-muted-foreground">{m.body}</p>
                      </div>
                    ))
                  )}
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => setOpen(false)}>Close</Button>
                </div>
              </CardContent>
            </Card>
          </div>,
          document.body
        )}
    </>
  )
}
