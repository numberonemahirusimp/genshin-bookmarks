import { MusicTrack, ThemeId } from '../types'

const regionNames: Record<ThemeId, string> = {
  mondstadt: 'Mondstadt',
  liyue: 'Liyue',
  inazuma: 'Inazuma',
  sumeru: 'Sumeru',
  fontaine: 'Fontaine',
  nodkrai: 'Nodkrai',
}

let cachedManifest: Record<string, MusicTrack[]> | null = null

export async function loadManifest(): Promise<Record<string, MusicTrack[]>> {
  if (cachedManifest) return cachedManifest

  try {
    const url = typeof chrome !== 'undefined' && chrome.runtime?.getURL
      ? chrome.runtime.getURL('music/manifest.json')
      : '/music/manifest.json'
    const res = await fetch(url)
    const data = await res.json()
    cachedManifest = data
    return data
  } catch {
    return {}
  }
}

export function getCachedManifest(): Record<string, MusicTrack[]> {
  return cachedManifest || {}
}

export function getRegionTracks(region: ThemeId): MusicTrack[] {
  return cachedManifest?.[region] || []
}

export function regionLabel(id: ThemeId): string {
  return regionNames[id] || id
}
