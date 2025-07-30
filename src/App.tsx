import { ThemeProvider } from '@/components/theme-provider'
import { Button } from './components/ui/button'
import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex min-h-svh flex-col items-center justify-center">
        <Button onClick={() => setCount(count + 1)}>Click me count is {count}</Button>
        <Button variant="destructive">Buttons</Button>
      </div>
    </ThemeProvider>
  )
}

export default App
