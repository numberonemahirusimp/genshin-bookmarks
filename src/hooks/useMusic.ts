import { useState, useEffect, useRef, useCallback } from 'react'
import { MusicTrack, MusicState, ThemeId } from '../types'
import { loadManifest, getCachedManifest, getRegionTracks } from '../data/music'

const defaults: MusicState = {
  enabled: false,
  volume: 0.3,
  currentTrackIndex: 0,
  isPlaying: false,
  shuffle: false,
  loop: false,
  customTracks: [],
}

export function useMusic(themeId: ThemeId) {
  const [state, setState] = useState<MusicState>(() => {
    try {
      const stored = localStorage.getItem('teyvat-music-state')
      if (stored) return { ...defaults, ...JSON.parse(stored) }
    } catch {}
    return defaults
  })

  const [tracks, setTracks] = useState<MusicTrack[]>([])
  const [manifestLoaded, setManifestLoaded] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    loadManifest().then(() => {
      setManifestLoaded(true)
    })
  }, [])

  useEffect(() => {
    if (manifestLoaded) {
      setTracks(getRegionTracks(themeId))
      setState(prev => ({ ...prev, currentTrackIndex: 0, isPlaying: false }))
    }
  }, [themeId, manifestLoaded])

  useEffect(() => {
    localStorage.setItem('teyvat-music-state', JSON.stringify(state))
  }, [state])

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.volume = state.volume
    }
    const audio = audioRef.current
    audio.volume = state.volume

    if (state.enabled && state.isPlaying && tracks.length > 0) {
      const track = tracks[state.currentTrackIndex] || tracks[0]
      const src = trackUrl(track)
      if (audio.src !== src) {
        audio.src = src
        audio.load()
      }
      audio.play().catch(() => {
        setState(prev => ({ ...prev, isPlaying: false }))
      })
    } else {
      audio.pause()
    }

    const onEnd = () => state.loop ? restart() : next()
    audio.addEventListener('ended', onEnd)
    return () => audio.removeEventListener('ended', onEnd)
  }, [state.enabled, state.isPlaying, state.currentTrackIndex, state.volume, tracks])

  function trackUrl(track: MusicTrack): string {
    const base = typeof chrome !== 'undefined' && chrome.runtime?.getURL ? chrome.runtime.getURL('') : '/'
    return `${base}music/${track.region}/${track.filename}`
  }

  const restart = useCallback(() => {
    const audio = audioRef.current
    if (audio) { audio.currentTime = 0; audio.play().catch(() => {}) }
  }, [])

  const play = useCallback(() => setState(prev => ({ ...prev, isPlaying: true, enabled: true })), [])
  const pause = useCallback(() => setState(prev => ({ ...prev, isPlaying: false })), [])
  const toggle = useCallback(() => setState(prev => ({ ...prev, isPlaying: !prev.isPlaying, enabled: true })), [])
  const toggleLoop = useCallback(() => setState(prev => ({ ...prev, loop: !prev.loop })), [])

  const next = useCallback(() => {
    setState(prev => {
      if (tracks.length === 0) return prev
      const n = prev.currentTrackIndex + 1
      if (n >= tracks.length) return { ...prev, currentTrackIndex: 0, isPlaying: true }
      return { ...prev, currentTrackIndex: n, isPlaying: true }
    })
  }, [tracks.length])

  const prev = useCallback(() => {
    setState(prev => {
      if (tracks.length === 0) return prev
      const p = prev.currentTrackIndex - 1
      if (p < 0) return { ...prev, currentTrackIndex: tracks.length - 1, isPlaying: true }
      return { ...prev, currentTrackIndex: p, isPlaying: true }
    })
  }, [tracks.length])

  const playTrack = useCallback((index: number) => {
    if (tracks.length === 0) return
    setState(prev => ({
      ...prev,
      currentTrackIndex: Math.max(0, Math.min(index, tracks.length - 1)),
      isPlaying: true,
      enabled: true,
    }))
  }, [tracks.length])

  const setVolume = useCallback((v: number) => setState(prev => ({ ...prev, volume: Math.max(0, Math.min(1, v)) })), [])
  const setEnabled = useCallback((v: boolean) => setState(prev => ({ ...prev, enabled: v, isPlaying: v ? prev.isPlaying : false })), [])

  const currentTrack = tracks[state.currentTrackIndex] || null

  return {
    ...state,
    tracks,
    currentTrack,
    manifestLoaded,
    play,
    pause,
    toggle,
    toggleLoop,
    playNext: next,
    playPrev: prev,
    playTrack,
    setVolume,
    setEnabled,
  }
}
