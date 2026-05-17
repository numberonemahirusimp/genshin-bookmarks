import { WallpaperEntry } from '../types'

let cachedManifest: WallpaperEntry[] | null = null

export async function loadWallpaperManifest(): Promise<WallpaperEntry[]> {
  if (cachedManifest) return cachedManifest
  try {
    const url = typeof chrome !== 'undefined' && chrome.runtime?.getURL
      ? chrome.runtime.getURL('wallpapers/manifest.json')
      : '/wallpapers/manifest.json'
    const res = await fetch(url)
    if (!res.ok) return []
    const data = await res.json()
    cachedManifest = data
    return data
  } catch {
    return []
  }
}

export function getCachedWallpapers(): WallpaperEntry[] {
  return cachedManifest || []
}

export function wallpaperUrl(path: string): string {
  const base = typeof chrome !== 'undefined' && chrome.runtime?.getURL ? chrome.runtime.getURL('wallpapers/') : '/wallpapers/'
  return `${base}${path}`
}
