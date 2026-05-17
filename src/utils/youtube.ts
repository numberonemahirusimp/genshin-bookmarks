export type YouTubeEmbedMode = 'standard' | 'privacy' | 'plain'

export const youtubeEmbedModes: { id: YouTubeEmbedMode; label: string }[] = [
  { id: 'standard', label: 'Standard' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'plain', label: 'Plain' },
]

export function buildYouTubeEmbedUrl(id: string, query = '', mode: YouTubeEmbedMode = 'standard'): string {
  const params = new URLSearchParams(query)
  params.set('rel', '0')
  params.set('playsinline', '1')

  if (mode === 'standard') {
    params.set('enablejsapi', '1')
    const origin = getPlayerOrigin()
    if (origin) {
      params.set('origin', origin)
      params.set('widget_referrer', origin)
    }
  }

  const host = mode === 'privacy' ? 'https://www.youtube-nocookie.com' : 'https://www.youtube.com'
  return `${host}/embed/${id}?${params.toString()}`
}

function getPlayerOrigin(): string | null {
  if (typeof window === 'undefined') return null
  // In Chrome extension context, don't send origin — YouTube rejects chrome-extension:// URLs
  if (window.location.protocol === 'chrome-extension:') return null
  if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
    return window.location.origin
  }
  return null
}
