import { ThemeProvider } from '@/components/theme-provider'
import { Button } from './components/ui/button'
import { useEffect, useState } from 'react'
import { AreaChartExample } from './components/game/area-chart-example'
import { Progress } from './components/ui/progress'
import { ChartAreaGradient } from './components/game/chart-area-gradient'

function App() {
  const [count, setCount] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 100 ? 0 : prev + 10))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex min-h-svh flex-col items-center justify-center">
        <Progress value={progress} className="w-64 mb-4" />
        <Button
          onClick={() => {
            setCount(count + 1)
            setProgress(progress + 10)
          }}
        >
          Click me count is {count}
        </Button>
        <Button variant="ghost">Buttons</Button>
      </div>
      <AreaChartExample />
      <ChartAreaGradient />
    </ThemeProvider>
  )
}

export default App
