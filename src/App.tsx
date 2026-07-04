import './App.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { AnimationOverlay } from '@/components/animation/animation-overlay'
import { ScreenWrapper } from './components/game/screens/screen-wrapper'
import { TutorialOverlay } from './components/game/tutorial-overlay'
import { HelpPanel } from './components/game/help-panel'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ScreenWrapper />
      <AnimationOverlay />
      <TutorialOverlay />
      <HelpPanel />
      <Toaster position="top-center" />
    </ThemeProvider>
  )
}

export default App
