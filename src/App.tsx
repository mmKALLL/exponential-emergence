import "./App.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ScreenWrapper } from "./components/game/screens/screen-wrapper";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ScreenWrapper />
    </ThemeProvider>
  );
}

export default App;
