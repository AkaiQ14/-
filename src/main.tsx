import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import './styles/buttons-layout.css'
import './styles/site-logo.css'
import './animations.css'
import './styles/pages-shared.css'
import './styles/site-background.css'
import './styles/game-modes.css'
import './styles/brutal-theme.css'
import './styles/theme.css'
import './styles/hidden-player.css'
import App from './App'
import './store/themeStore'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)
