import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/variables.css'
import './styles/global.css'
import './styles/components.css'
import App from './App.jsx'

// Apply saved theme
const savedTheme = localStorage.getItem('rz_theme')
if (savedTheme && savedTheme !== 'indigo') {
  document.documentElement.setAttribute('data-theme', savedTheme)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
