export type YouTubeEmbedMode = 'standard' | 'privacy' | 'plain'

export const youtubeEmbedModes: { id: YouTubeEmbedMode; label: string }[] = [
  { id: 'standard', label: 'Standard' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'plain', label: 'Plain' },
]

export function extractYouTubeVideoId(input: string): string | null {
  const value = input.trim()

  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
    return value
  }

  try {
    const url = new URL(value)

    if (url.hostname.includes('youtu.be')) {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null
    }

    if (url.hostname.includes('youtube.com')) {
      if (url.pathname.startsWith('/watch')) {
        const id = url.searchParams.get('v')
        return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null
      }

      if (url.pathname.startsWith('/embed/')) {
        const id = url.pathname.split('/embed/')[1]?.split('/')[0]
        return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null
      }

      if (url.pathname.startsWith('/shorts/')) {
        const id = url.pathname.split('/shorts/')[1]?.split('/')[0]
        return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null
      }
    }
  } catch {
    return null
  }

  return null
}

export function buildYouTubeEmbedUrl(
  input: string,
  query = '',
  mode: YouTubeEmbedMode = 'privacy'
): string {
  const id = extractYouTubeVideoId(input)

  if (!id) {
    return ''
  }

  const params = new URLSearchParams(query)
  params.set('rel', '0')
  params.set('playsinline', '1')

  const host =
    mode === 'privacy'
      ? 'https://www.youtube-nocookie.com'
      : 'https://www.youtube.com'

  return `${host}/embed/${id}?${params.toString()}`
}
