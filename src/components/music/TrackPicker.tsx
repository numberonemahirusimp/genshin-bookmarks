import { useState, useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MusicTrack } from '../../types'

interface TrackPickerProps {
  tracks: MusicTrack[]
  currentTrackIndex: number
  isPlaying: boolean
  volume: number
  onPlayTrack: (index: number) => void
  onSetVolume: (v: number) => void
  onClose: () => void
}

export function TrackPicker({ tracks, currentTrackIndex, isPlaying, volume, onPlayTrack, onSetVolume, onClose }: TrackPickerProps) {
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const filtered = useMemo(() => {
    if (!search.trim()) return tracks
    const q = search.toLowerCase()
    return tracks.filter(t => t.title?.toLowerCase().includes(q) || t.filename?.toLowerCase().includes(q))
  }, [tracks, search])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.94, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', width: '90%', maxWidth: 420, maxHeight: '70vh', display: 'flex', flexDirection: 'column',
          background: 'rgba(12,15,24,0.92)', backdropFilter: 'blur(30px)', border: '1px solid rgba(212,163,90,0.1)', borderRadius: 18, overflow: 'hidden',
          boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid rgba(212,163,90,0.06)' }}>
          <span style={{ fontSize: 11, fontWeight: 300, letterSpacing: '0.05em', color: 'rgba(242,229,204,0.5)' }}>Track Browser</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(141,150,171,0.25)', fontSize: 12 }}>✕</button>
        </div>

        {/* Search */}
        <div style={{ padding: '8px 12px' }}>
          <input ref={inputRef} type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tracks..."
            style={{ width: '100%', padding: '7px 10px', borderRadius: 8, fontSize: 11, fontWeight: 300, border: '1px solid rgba(212,163,90,0.08)',
              background: 'rgba(0,0,0,0.2)', color: 'rgba(242,229,204,0.5)', outline: 'none', boxSizing: 'border-box' }} />
        </div>

        {/* Track count */}
        <div style={{ padding: '4px 16px 8px', fontSize: 9, color: 'rgba(141,150,171,0.2)' }}>
          {filtered.length} of {tracks.length} tracks
        </div>

        {/* Track list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 8px' }}>
          {filtered.length === 0 && (
            <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 10, color: 'rgba(141,150,171,0.15)' }}>No tracks found</div>
          )}
          {filtered.map((track, i) => {
            const idx = tracks.indexOf(track)
            const isCurrent = idx === currentTrackIndex
            return (
              <button key={track.filename} onClick={() => onPlayTrack(idx)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 8,
                  border: 'none', cursor: 'pointer', textAlign: 'left', marginBottom: 2,
                  background: isCurrent ? 'rgba(212,163,90,0.06)' : 'transparent',
                  color: isCurrent ? 'rgba(242,229,204,0.6)' : 'rgba(141,150,171,0.35)',
                  fontSize: 11, fontWeight: isCurrent ? 400 : 300, transition: 'all 0.15s' }}
                onMouseEnter={e => { if (!isCurrent) { e.currentTarget.style.background = 'rgba(212,163,90,0.03)'; e.currentTarget.style.color = 'rgba(242,229,204,0.4)' } }}
                onMouseLeave={e => { if (!isCurrent) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(141,150,171,0.35)' } }}>
                <span style={{ flexShrink: 0, fontSize: 9, width: 14, textAlign: 'center', color: isCurrent ? 'rgba(212,163,90,0.3)' : 'rgba(141,150,171,0.12)' }}>
                  {isCurrent ? (isPlaying ? '▶' : '■') : i + 1}
                </span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {track.title || track.filename?.replace(/\.\w+$/, '') || 'Untitled'}
                </span>
              </button>
            )
          })}
        </div>

        {/* Bottom volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px 10px', borderTop: '1px solid rgba(212,163,90,0.06)' }}>
          <span style={{ fontSize: 9, color: 'rgba(141,150,171,0.2)', flexShrink: 0 }}>Volume</span>
          <input type="range" min="0" max="1" step="0.05" value={volume} onChange={e => onSetVolume(parseFloat(e.target.value))}
            style={{ flex: 1, height: 2, accentColor: 'rgba(212,163,90,0.3)', cursor: 'pointer' }} />
          <span style={{ fontSize: 9, color: 'rgba(141,150,171,0.15)', minWidth: 24, textAlign: 'right', flexShrink: 0 }}>{Math.round(volume * 100)}%</span>
        </div>
      </motion.div>
    </div>
  )
}
