import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Archive, Heart, Clock, Globe, Home, BookmarkIcon, Music, Sparkles } from '../ui/Icons'
import { ThemeId } from '../../types'
import { useMusic } from '../../hooks/useMusic'
import { TrackPicker } from '../music/TrackPicker'

export type DockView = 'home' | 'bookmarks' | 'favorites' | 'recent' | 'feed' | 'genshin'

interface DockItem {
  id: DockView
  icon: typeof Archive
  label: string
}

const dockItems: DockItem[] = [
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'bookmarks', icon: BookmarkIcon, label: 'Bookmarks' },
  { id: 'favorites', icon: Heart, label: 'Favorites' },
  { id: 'recent', icon: Clock, label: 'Recent' },
  { id: 'feed', icon: Sparkles, label: 'Feed' },
  { id: 'genshin', icon: Globe, label: 'Genshin' },
]

interface DockProps {
  activeView: DockView
  onViewChange: (view: DockView) => void
  hasGenshinAuth?: boolean
  themeId: ThemeId
}

const playIcon = (
  <svg width="7" height="7" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
)
const pauseIcon = (
  <svg width="7" height="7" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
)
const prevIcon = (
  <svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor"><polygon points="19 20 9 12 19 4 19 20" /><line x1="5" y1="19" x2="5" y2="5" stroke="currentColor" strokeWidth="2" /></svg>
)
const nextIcon = (
  <svg width="6" height="6" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 4 15 12 5 20 5 4" /><line x1="19" y1="5" x2="19" y2="19" stroke="currentColor" strokeWidth="2" /></svg>
)
const loopIcon = (
  <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
)

export function Dock({ activeView, onViewChange, hasGenshinAuth, themeId }: DockProps) {
  const music = useMusic(themeId)
  const [expanded, setExpanded] = useState(false)
  const [showPicker, setShowPicker] = useState(false)
  const hideTimer = useRef<ReturnType<typeof setTimeout>>()
  const areaRef = useRef<HTMLDivElement>(null)

  const btn: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 16, height: 16, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0,
    background: 'var(--wallpaper-control-active)', color: 'var(--color-text-secondary)',
    transition: 'all 0.15s',
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 px-3 pb-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center w-full max-w-[640px] mx-auto px-3 py-2"
          style={{
            borderRadius: 999,
            background: 'var(--wallpaper-panel-bg)',
            backdropFilter: 'blur(28px) saturate(0.9)',
            WebkitBackdropFilter: 'blur(28px) saturate(0.9)',
            border: '1px solid var(--color-border)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08), 0 -2px 50px rgba(0,0,0,0.42)',
          }}
        >
          {/* Nav items */}
          <div className="flex flex-1 items-center justify-between px-1">
            {dockItems.map((item) => {
              const isActive = activeView === item.id
              return (
                <motion.button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className="relative flex items-center justify-center"
                  style={{ width: 40, height: 40 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <div
                    className="flex items-center justify-center w-full h-full rounded-full transition-all duration-200"
                    style={{
                      color: isActive ? 'var(--color-gold-light)' : 'var(--color-text-secondary)',
                      background: isActive ? 'var(--wallpaper-control-active)' : 'rgba(255,255,255,0.018)',
                      border: isActive ? '1px solid var(--color-border)' : '1px solid rgba(229, 194, 137, 0.12)',
                    }}
                  >
                    <item.icon size={18} />
                  </div>
                  {item.id === 'genshin' && hasGenshinAuth && (
                    <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full"
                      style={{ background: 'rgba(74, 222, 128, 0.6)', boxShadow: '0 0 6px rgba(74, 222, 128, 0.3)' }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>

          {/* Music section */}
          <div className="flex items-center ml-2">
            <div ref={areaRef}
              onMouseEnter={() => { clearTimeout(hideTimer.current); setExpanded(true) }}
              onMouseLeave={() => { hideTimer.current = setTimeout(() => setExpanded(false), 250) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 3,
                padding: '5px 6px', borderRadius: 12, cursor: 'pointer',
                background: expanded ? 'var(--wallpaper-control-active)' : 'transparent',
                transition: 'all 0.3s',
              }}
            >
              <Music size={13} style={{
                color: music.enabled ? 'var(--color-gold-light)' : 'var(--color-text-secondary)',
                transition: 'color 0.3s',
              }} />

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    style={{ display: 'flex', alignItems: 'center', gap: 3, overflow: 'hidden' }}
                    onClick={e => e.stopPropagation()}
                  >
                    {music.tracks.length === 0 ? (
                      <span style={{ fontSize: 9, color: 'rgba(141,150,171,0.3)', whiteSpace: 'nowrap', paddingRight: 4 }}>Loading…</span>
                    ) : !music.enabled ? (
                      <button onClick={() => music.setEnabled(true)}
                        style={{ fontSize: 9, color: 'rgba(212,163,90,0.4)', whiteSpace: 'nowrap', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px', lineHeight: 1 }}>
                        Play
                      </button>
                    ) : (
                      <>
                        <button style={btn} onClick={() => music.playPrev()}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-gold-light)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-secondary)' }}>
                          {prevIcon}
                        </button>
                        <button style={btn} onClick={() => music.toggle()}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-gold-light)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-secondary)' }}>
                          {music.isPlaying ? pauseIcon : playIcon}
                        </button>
                        <button style={btn} onClick={() => music.playNext()}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-gold-light)' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-text-secondary)' }}>
                          {nextIcon}
                        </button>

                        <span style={{
                          fontSize: 9, color: 'rgba(242,229,204,0.4)', maxWidth: 80,
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {music.currentTrack?.title || 'Unknown'}
                        </span>

                        <button onClick={() => music.toggleLoop()}
                          style={{
                            ...btn, width: 14, height: 14,
                            background: music.loop ? 'var(--wallpaper-control-active)' : 'var(--wallpaper-control-bg)',
                            color: music.loop ? 'var(--color-gold-light)' : 'var(--color-text-secondary)',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color = 'var(--color-gold-light)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = music.loop ? 'var(--wallpaper-control-active)' : 'var(--wallpaper-control-bg)'; e.currentTarget.style.color = music.loop ? 'var(--color-gold-light)' : 'var(--color-text-secondary)' }}>
                          {loopIcon}
                        </button>
                        <button onClick={() => setShowPicker(true)}
                          style={{ ...btn, width: 14, height: 14, fontSize: 7 }}>
                          ♪
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {showPicker && (
        <TrackPicker
          tracks={music.tracks}
          currentTrackIndex={music.currentTrackIndex}
          isPlaying={music.isPlaying}
          volume={music.volume}
          onPlayTrack={(i) => music.playTrack(i)}
          onSetVolume={(v) => music.setVolume(v)}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  )
}
