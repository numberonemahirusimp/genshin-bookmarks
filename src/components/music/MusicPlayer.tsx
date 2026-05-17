import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ThemeId } from '../../types'
import { useMusic } from '../../hooks/useMusic'
import { regionLabel } from '../../data/music'

interface MusicPlayerProps {
  themeId: ThemeId
}

const noteIcon = (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
  </svg>
)

const playIcon = (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
)

const pauseIcon = (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
  </svg>
)

const prevIcon = (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" />
  </svg>
)

const nextIcon = (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" />
  </svg>
)

export function MusicPlayer({ themeId }: MusicPlayerProps) {
  const music = useMusic(themeId)
  const [expanded, setExpanded] = useState(false)

  const hasTracks = music.tracks.length > 0

  const barStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '5px 10px', borderRadius: 20,
    background: 'rgba(12,15,24,0.65)', backdropFilter: 'blur(20px)',
    border: '1px solid rgba(212,163,90,0.06)',
    fontSize: 9, fontWeight: 300,
    color: 'rgba(141,150,171,0.4)',
    cursor: 'pointer', transition: 'all 0.2s',
    userSelect: 'none',
  }

  const btnStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 18, height: 18, borderRadius: '50%',
    border: 'none', cursor: 'pointer', flexShrink: 0,
    background: 'rgba(212,163,90,0.08)',
    color: 'rgba(242,229,204,0.4)',
    transition: 'all 0.15s',
  }

  if (!hasTracks) {
    return (
      <div style={{ position: 'fixed', bottom: 68, left: 20, zIndex: 40 }}>
        <div style={{ ...barStyle, opacity: 0.3 }}>
          {noteIcon}
          <span style={{ fontSize: 8 }}>No tracks yet</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'fixed', bottom: 68, left: 20, zIndex: 40 }}>
      <AnimatePresence>
        {music.enabled ? (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.92 }} transition={{ duration: 0.15 }}
            style={barStyle}
            onMouseEnter={() => setExpanded(true)}
            onMouseLeave={() => setExpanded(false)}>

            {/* Play/Pause */}
            <button style={btnStyle} onClick={(e) => { e.stopPropagation(); music.toggle() }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212,163,90,0.15)'; e.currentTarget.style.color = 'rgba(242,229,204,0.6)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(212,163,90,0.08)'; e.currentTarget.style.color = 'rgba(242,229,204,0.4)' }}>
              {music.isPlaying ? pauseIcon : playIcon}
            </button>

            {/* Prev */}
            <button style={btnStyle} onClick={(e) => { e.stopPropagation(); music.playPrev() }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212,163,90,0.15)'; e.currentTarget.style.color = 'rgba(242,229,204,0.6)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(212,163,90,0.08)'; e.currentTarget.style.color = 'rgba(242,229,204,0.4)' }}>
              {prevIcon}
            </button>

            {/* Next */}
            <button style={btnStyle} onClick={(e) => { e.stopPropagation(); music.playNext() }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212,163,90,0.15)'; e.currentTarget.style.color = 'rgba(242,229,204,0.6)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(212,163,90,0.08)'; e.currentTarget.style.color = 'rgba(242,229,204,0.4)' }}>
              {nextIcon}
            </button>

            {/* Track info */}
            <div style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 9, color: 'rgba(242,229,204,0.4)' }}>
              {music.currentTrack?.title || 'Unknown'}
            </div>

            <div style={{ fontSize: 7, color: 'rgba(141,150,171,0.2)', padding: '1px 4px', border: '1px solid rgba(212,163,90,0.06)', borderRadius: 4 }}>
              {regionLabel(themeId)}
            </div>

            {/* Volume slider - shows on hover */}
            {expanded && (
              <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 50 }} exit={{ opacity: 0, width: 0 }} transition={{ duration: 0.12 }}
                style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}
                onClick={(e) => e.stopPropagation()}>
                <input type="range" min="0" max="1" step="0.05" value={music.volume}
                  onChange={(e) => music.setVolume(parseFloat(e.target.value))}
                  style={{ width: 50, height: 2, accentColor: 'rgba(212,163,90,0.3)', cursor: 'pointer' }} />
              </motion.div>
            )}

            {/* Close */}
            <button onClick={(e) => { e.stopPropagation(); music.setEnabled(false) }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(141,150,171,0.15)', fontSize: 8, padding: 0, lineHeight: 1 }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(141,150,171,0.4)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(141,150,171,0.15)'}>
              ✕
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 8, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.92 }} transition={{ duration: 0.15 }}
            style={barStyle}
            onClick={() => music.setEnabled(true)}>
            {noteIcon}
            <span style={{ fontSize: 8 }}>Play music</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
