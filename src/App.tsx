import './App.css'
import { ThemeProvider } from '@/components/theme-provider'
import { GameStateProvider } from './lib/gamestate-hooks'
import { ScreenWrapper } from './components/game/screens/screen-wrapper'

function App() {
  return (
    <GameStateProvider>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <ScreenWrapper />
      </ThemeProvider>
    </GameStateProvider>
  )
}

export default App
