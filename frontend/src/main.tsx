import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { ThemeModeProvider } from './contexts/ThemeModeContext'
import './styles/auth.css'
import './styles/ui.css'
import { initPerformanceMonitor } from './utils/performanceMonitor'

// Inicializa monitoramento de performance (condicionado por VITE_ENABLE_PERF_MONITOR)
initPerformanceMonitor()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeModeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeModeProvider>
  </StrictMode>,
)
