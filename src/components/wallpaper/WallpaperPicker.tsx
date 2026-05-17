import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { X, Check, Plus, Trash2 as Trash } from '../ui/Icons'
import { WallpaperEntry, WallpaperState } from '../../types'
import { wallpaperUrl } from '../../data/wallpapers'

interface WallpaperPickerProps {
  wallpapers: WallpaperEntry[]
  mode: WallpaperState['mode']
  active: string | null
  opacity: number
  customWallpapers: { name: string; data: string }[]
  onSetMode: (mode: WallpaperState['mode']) => void
  onSetActive: (path: string | null) => void
  onSetOpacity: (opacity: number) => void
  onAddCustom: (name: string, data: string) => void
  onDeleteCustom: (index: number) => void
  onHideBuiltin: (path: string) => void
  onRestoreBuiltin: (path: string) => void
  onClose: () => void
}

const HIDDEN_KEY = 'teyvat-hidden-wallpapers'

function loadHidden(): Set<string> {
  try {
    const raw = localStorage.getItem(HIDDEN_KEY)
    return new Set(raw ? JSON.parse(raw) : [])
  } catch { return new Set() }
}

function saveHidden(hidden: Set<string>) {
  localStorage.setItem(HIDDEN_KEY, JSON.stringify([...hidden]))
}

export function WallpaperPicker({
  wallpapers, mode, active, opacity,
  customWallpapers,
  onSetMode, onSetActive, onSetOpacity,
  onAddCustom, onDeleteCustom,
  onHideBuiltin, onRestoreBuiltin, onClose,
}: WallpaperPickerProps) {
  const [search, setSearch] = useState('')
  const [hidden, setHidden] = useState<Set<string>>(loadHidden)
  const [ready, setReady] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { const t = setTimeout(() => setReady(true), 300); return () => clearTimeout(t) }, [])

  useEffect(() => {
    inputRef.current?.focus()
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => { saveHidden(hidden) }, [hidden])

  const visible = useMemo(() => {
    let list = wallpapers.filter(w => !hidden.has(w.path))
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(w => w.path.toLowerCase().includes(q))
    }
    return list
  }, [wallpapers, search, hidden])

  const hiddenCount = wallpapers.length - visible.length

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const data = reader.result as string
      onAddCustom(file.name, data)
    }
    reader.readAsDataURL(file)
  }, [onAddCustom])

  const toggleHide = useCallback((path: string) => {
    setHidden(prev => {
      const next = new Set(prev)
      if (next.has(path)) { next.delete(path); onRestoreBuiltin(path) }
      else {
        next.add(path)
        onHideBuiltin(path)
        if (active === path) onSetActive(null)
      }
      return next
    })
  }, [active, onHideBuiltin, onRestoreBuiltin, onSetActive])

  const bulkUnhide = useCallback(() => {
    setHidden(new Set())
  }, [])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      style={{ backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
    >
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="relative flex flex-col w-full max-w-[720px] max-h-[min(92dvh,760px)] overflow-hidden"
        style={{
          background: 'var(--wallpaper-panel-bg)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          boxShadow: '0 25px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-2 sm:px-5">
          <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, color: 'var(--color-text)' }}>
            Wallpaper Gallery
          </span>
          <div className="flex min-w-0 items-center gap-2">
            {mode === 'image' && active && (
              <button onClick={() => onSetActive(null)}
                style={{
                  fontSize: 10, padding: '5px 9px', borderRadius: 8, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.08)', border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}>
                Remove
              </button>
            )}
            {hiddenCount > 0 && (
              <button onClick={bulkUnhide}
                style={{
                  fontSize: 10, padding: '5px 9px', borderRadius: 8, cursor: 'pointer',
                  background: 'var(--wallpaper-control-active)', border: '1px solid var(--color-border)',
                  color: 'var(--color-gold-light)',
                }}>
                Restore {hiddenCount}
              </button>
            )}
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: 4 }}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-4 pb-2 sm:px-5">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search wallpapers…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '8px 12px', borderRadius: 10,
              background: 'rgba(255,255,255,0.08)', border: '1px solid var(--color-border)',
              color: 'var(--color-text)', fontSize: 12, outline: 'none',
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-3 sm:px-5 space-y-2">
          {!ready ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.15)', fontSize: 11 }}>
              Loading…
            </div>
          ) : (<>
          {/* Wallpaper grid */}
          {visible.length > 0 && (
            <div className="wallpaper-grid">
              {visible.map((wp) => {
                const isActive = mode === 'image' && active === wp.path
                const url = wallpaperUrl(wp.path)
                return (
                  <div key={wp.path} style={{ position: 'relative', contentVisibility: 'auto', containIntrinsicSize: '150px' }}>
                    <button
                      onClick={() => onSetActive(wp.path)}
                      style={{
                        width: '100%', cursor: 'pointer', borderRadius: 10, overflow: 'hidden',
                        aspectRatio: '16/9', padding: 0,
                        background: 'rgba(255,255,255,0.04)',
                        border: isActive ? '2px solid var(--color-gold-light)' : '2px solid transparent',
                        transition: 'border-color 0.15s',
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.borderColor = 'var(--color-border)' }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.borderColor = 'transparent' }}
                    >
                      <img
                        src={url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                      {isActive && (
                        <div style={{
                          position: 'absolute', top: 4, right: 26,
                          background: 'var(--color-gold-light)', borderRadius: '50%',
                          width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Check size={10} style={{ color: '#120c0a' }} />
                        </div>
                      )}
                      <div style={{
                        position: 'absolute', bottom: 0, left: 0, right: 0,
                        padding: '3px 5px', fontSize: 8, color: 'rgba(255,255,255,0.7)',
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                        textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap',
                      }}>
                        {wp.path.split('/').pop()?.replace(/\.[^.]+$/, '').replace(/_/g, ' ') || wp.path}
                      </div>
                    </button>
                    {/* Hide button */}
                    <button
                      onClick={() => toggleHide(wp.path)}
                      title="Remove from gallery"
                      style={{
                        position: 'absolute', top: 4, left: 4, width: 18, height: 18,
                        borderRadius: '50%', border: 'none', cursor: 'pointer',
                        background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 9, zIndex: 2,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,80,80,0.7)'; e.currentTarget.style.color = 'white' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.45)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
                    >
                      <Trash size={9} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {wallpapers.length === 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>
              No wallpapers downloaded yet.
            </div>
          )}

          {/* Custom wallpapers */}
          {customWallpapers.length > 0 && (
            <div style={{ paddingTop: 8 }}>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginBottom: 6 }}>Uploaded</div>
              <div className="wallpaper-grid">
                {customWallpapers.map((cw, i) => {
                  const isActive = mode === 'image' && active === cw.data
                  return (
                    <div key={i} style={{ position: 'relative', contentVisibility: 'auto', containIntrinsicSize: '150px' }}>
                      <button
                        onClick={() => onSetActive(cw.data)}
                        style={{
                          width: '100%', cursor: 'pointer', borderRadius: 10, overflow: 'hidden',
                          aspectRatio: '16/9', padding: 0,
                          background: 'rgba(255,255,255,0.04)',
                          border: isActive ? '2px solid var(--color-gold-light)' : '2px solid transparent',
                        }}
                      >
                        <img src={cw.data} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        {isActive && (
                          <div style={{
                            position: 'absolute', top: 4, right: 26,
                            background: 'var(--color-gold-light)', borderRadius: '50%',
                            width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <Check size={10} style={{ color: '#120c0a' }} />
                          </div>
                        )}
                      </button>
                      <button
                        onClick={() => { onDeleteCustom(i); if (active === cw.data) onSetActive(null) }}
                        title="Delete uploaded"
                        style={{
                          position: 'absolute', top: 4, left: 4, width: 18, height: 18,
                          borderRadius: '50%', border: 'none', cursor: 'pointer',
                          background: 'rgba(0,0,0,0.45)', color: 'rgba(255,255,255,0.5)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, zIndex: 2,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,80,80,0.7)'; e.currentTarget.style.color = 'white' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.45)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
                      >
                        <Trash size={9} />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Upload button */}
          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-2 w-full"
            style={{
              padding: '10px', borderRadius: 12, cursor: 'pointer',
              background: 'rgba(255,255,255,0.04)', border: '1px dashed rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.35)', fontSize: 11, transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)' }}
          >
            <Plus size={12} />
            Upload Wallpaper
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
          </>)}
        </div>

        {/* Bottom: opacity slider */}
        {mode === 'image' && (
          <div className="flex flex-wrap items-center gap-3 px-4 pb-4 pt-2 sm:px-5">
            <span style={{ fontSize: 10, color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>Wallpaper</span>
            <input
              type="range" min="0.05" max="0.8" step="0.05" value={opacity}
              onChange={e => onSetOpacity(parseFloat(e.target.value))}
              style={{
                flex: '1 1 160px', height: 3, accentColor: 'var(--color-gold)', cursor: 'pointer',
              }}
            />
            <span style={{ fontSize: 10, color: 'var(--color-text-secondary)', width: 28, textAlign: 'right' }}>
              {Math.round(opacity * 100)}%
            </span>
            <button
              onClick={() => onSetActive(null)}
              style={{
                padding: '7px 10px', borderRadius: 8, cursor: 'pointer',
                background: 'rgba(255,255,255,0.08)', border: '1px solid var(--color-border)',
                color: 'var(--color-text)', fontSize: 11,
              }}
            >
              Remove Wallpaper
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
