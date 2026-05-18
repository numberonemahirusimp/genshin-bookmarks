import { useState, useEffect, useCallback } from 'react'
import { WallpaperEntry, WallpaperState } from '../types'
import { loadWallpaperManifest, wallpaperUrl } from '../data/wallpapers'

const STORAGE_KEY = 'teyvat-wallpaper-state'
const CUSTOM_KEY = 'teyvat-custom-wallpapers'

const defaults: WallpaperState = {
  mode: 'theme',
  active: null,
  opacity: 0.3,
}

interface CustomWallpaper { name: string; data: string }

export function useWallpaper() {
  const [state, setState] = useState<WallpaperState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return { ...defaults, ...JSON.parse(stored) }
    } catch {}
    return defaults
  })

  const [wallpapers, setWallpapers] = useState<WallpaperEntry[]>([])
  const [customWallpapers, setCustomWallpapers] = useState<CustomWallpaper[]>(() => {
    try {
      const stored = localStorage.getItem(CUSTOM_KEY)
      if (stored) return JSON.parse(stored)
    } catch {}
    return []
  })

  useEffect(() => {
    loadWallpaperManifest().then(setWallpapers)
  }, [])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY) {
        try {
          setState(event.newValue ? { ...defaults, ...JSON.parse(event.newValue) } : defaults)
        } catch {}
      }
      if (event.key === CUSTOM_KEY) {
        try {
          setCustomWallpapers(event.newValue ? JSON.parse(event.newValue) : [])
        } catch {}
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(customWallpapers))
  }, [customWallpapers])

  const setMode = useCallback((mode: WallpaperState['mode']) => {
    setState(prev => ({ ...prev, mode }))
  }, [])

  const setActive = useCallback((path: string | null) => {
    setState(prev => ({ ...prev, active: path, mode: path ? 'image' : 'theme' }))
  }, [])

  const setOpacity = useCallback((opacity: number) => {
    setState(prev => ({ ...prev, opacity: Math.max(0, Math.min(1, opacity)) }))
  }, [])

  const addCustomWallpaper = useCallback((name: string, data: string) => {
    setCustomWallpapers(prev => {
      const next = [...prev, { name, data }]
      return next
    })
  }, [])

  const deleteCustomWallpaper = useCallback((index: number) => {
    setCustomWallpapers(prev => prev.filter((_, i) => i !== index))
  }, [])

  const currentUrl = state.mode === 'image' && state.active
    ? (state.active.startsWith('data:') ? state.active : wallpaperUrl(state.active))
    : null

  return {
    ...state,
    wallpapers,
    customWallpapers,
    currentUrl,
    setMode,
    setActive,
    setOpacity,
    addCustomWallpaper,
    deleteCustomWallpaper,
  }
}
