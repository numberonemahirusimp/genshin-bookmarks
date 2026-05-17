import React from 'react'
import ReactDOM from 'react-dom/client'
import { PopupApp } from './popup'
import '../index.css'

function initTheme() {
  const root = document.documentElement
  root.style.setProperty('--color-primary', '#3a8da8')
  root.style.setProperty('--color-secondary', '#5ca9c2')
  root.style.setProperty('--color-accent', '#85c3d6')
  root.style.setProperty('--color-surface', 'rgba(15, 36, 49, 0.85)')
  root.style.setProperty('--color-surface-light', 'rgba(39, 78, 97, 0.6)')
  root.style.setProperty('--color-surface-dark', 'rgba(10, 25, 35, 0.95)')
  root.style.setProperty('--color-text', '#f0f7fa')
  root.style.setProperty('--color-text-secondary', '#b7dce8')
  root.style.setProperty('--color-border', 'rgba(133, 195, 214, 0.3)')
  root.style.setProperty('--color-glow', 'rgba(60, 141, 168, 0.4)')
  root.style.setProperty('--color-card-bg', 'rgba(39, 78, 97, 0.4)')
  root.style.setProperty('--color-sidebar-bg', 'rgba(10, 25, 35, 0.9)')
  root.style.setProperty('--color-header-bg', 'rgba(15, 36, 49, 0.8)')
  root.style.setProperty('--color-gold', '#d4a35a')
  root.style.setProperty('--color-gold-light', '#f2e5cc')
  root.style.setProperty('--color-gold-dark', '#a57339')
  root.style.setProperty('--theme-bg', 'linear-gradient(135deg, #0f2431 0%, #1c3a49 30%, #274e61 60%, #0f2431 100%)')
}

initTheme()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PopupApp />
  </React.StrictMode>
)
