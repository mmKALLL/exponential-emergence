import './App.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Button } from './components/ui/button'
import { useEffect, useState } from 'react'
import { AreaChartExample } from './components/game/area-chart-example'
import { Progress } from './components/ui/progress'
import { GameStateProvider, useGameState } from './lib/gamestate-hooks'

function App() {
  const { gs } = useGameState()
  const [count, setCount] = useState(gs.count)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 1))
    }, 50)

    return () => clearInterval(interval)
  }, [])

  return (
    <GameStateProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <div className="flex min-h-svh flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Exponential Emergence</h1>
        </div>
        <AreaChartExample />

        <div className="flex min-h-svh flex-col items-center justify-center">
          <Progress value={progress} className="w-64 mb-4" />
          <Button
            onClick={() => {
              setCount(count + 1)
              setProgress(progress + 10)
            }}
            variant="outline"
          >
            Click me count is {count}
          </Button>
          <Button variant="destructive">Buttons</Button>
        </div>
      </ThemeProvider>
    </GameStateProvider>
  )
}

export default App
