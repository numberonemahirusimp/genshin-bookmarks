import { useEffect, useCallback } from 'react'
import { ThemeId } from '../types'
import { getTheme, themes, defaultTheme } from '../themes'
import { db } from '../store'

function applyTheme(themeId: ThemeId) {
  const theme = getTheme(themeId)
  const root = document.documentElement
  const colors = theme.colors

  root.style.setProperty('--color-primary', colors.primary)
  root.style.setProperty('--color-secondary', colors.secondary)
  root.style.setProperty('--color-accent', colors.accent)
  root.style.setProperty('--color-surface', colors.surface)
  root.style.setProperty('--color-surface-light', colors.surfaceLight)
  root.style.setProperty('--color-surface-dark', colors.surfaceDark)
  root.style.setProperty('--color-text', colors.text)
  root.style.setProperty('--color-text-secondary', colors.textSecondary)
  root.style.setProperty('--color-border', colors.border)
  root.style.setProperty('--color-glow', colors.glow)
  root.style.setProperty('--color-card-bg', colors.cardBg)
  root.style.setProperty('--color-sidebar-bg', colors.sidebarBg)
  root.style.setProperty('--color-header-bg', colors.headerBg)
  root.style.setProperty('--color-gold', colors.gold)
  root.style.setProperty('--color-gold-light', colors.goldLight)
  root.style.setProperty('--color-gold-dark', colors.goldDark)
  root.style.setProperty('--theme-bg', theme.background)

  root.style.background = theme.background
  root.style.color = colors.text
  root.style.minHeight = '100vh'
}

export function useTheme(themeId: ThemeId, setThemeId: (id: ThemeId) => void) {
  useEffect(() => {
    applyTheme(themeId)
    db.setSetting('theme', themeId).catch(() => {})
  }, [themeId])

  const loadSavedTheme = useCallback(async () => {
    try {
      const saved = await db.getSetting('theme')
      if (saved && themes[saved as ThemeId]) {
        setThemeId(saved as ThemeId)
      }
    } catch {
      setThemeId(defaultTheme)
    }
  }, [setThemeId])

  useEffect(() => {
    loadSavedTheme()
  }, [loadSavedTheme])

  return { applyTheme, currentTheme: getTheme(themeId) }
}
