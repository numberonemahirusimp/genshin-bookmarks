import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
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
  const [renderCount, setRenderCount] = useState(8)
  const [closing, setClosing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

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

  // Scroll to active wallpaper
  useEffect(() => {
    if (active && scrollRef.current) {
      const el = scrollRef.current.querySelector(`[data-wp="${active}"]`)
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [active])

  // Stagger rendering: show 4 more items per animation frame
  useEffect(() => {
    setRenderCount(8)
    let raf: number
    let scheduled = false
    const schedule = () => {
      if (scheduled) return
      scheduled = true
      raf = requestAnimationFrame(() => {
        scheduled = false
        setRenderCount(prev => {
          if (prev >= visible.length) return prev
          return Math.min(prev + 4, visible.length)
        })
        if (renderCount < visible.length) schedule()
      })
    }
    schedule()
    return () => cancelAnimationFrame(raf)
  }, [visible.length])

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

  const handleClose = useCallback(() => {
    setClosing(true)
    setTimeout(onClose, 150)
  }, [onClose])

  const rendered = visible.slice(0, renderCount)
  const hasMore = renderCount < visible.length

  return (
    <div
      className={`wp-overlay${closing ? ' wp-overlay-closing' : ''}`}
      onClick={handleClose}
    >
      <div
        className={`wp-panel${closing ? ' wp-panel-closing' : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="wp-header">
          <span className="wp-title">Wallpaper Gallery</span>
          <div className="wp-header-actions">
            {mode === 'image' && active && (
              <button className="wp-btn wp-btn-sm" onClick={() => onSetActive(null)}>
                Remove
              </button>
            )}
            {hiddenCount > 0 && (
              <button className="wp-btn wp-btn-sm wp-btn-gold" onClick={bulkUnhide}>
                Restore {hiddenCount}
              </button>
            )}
            <button className="wp-close-btn" onClick={handleClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="wp-search">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search wallpapers…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="wp-search-input"
          />
        </div>

        {/* Content */}
        <div className="wp-content" ref={scrollRef}>
          {visible.length === 0 && wallpapers.length === 0 && (
            <div className="wp-empty">No wallpapers downloaded yet.</div>
          )}

          {visible.length === 0 && wallpapers.length > 0 && (
            <div className="wp-empty">No wallpapers match your search.</div>
          )}

          {/* Wallpaper grid */}
          {rendered.length > 0 && (
            <div className="wallpaper-grid">
              {rendered.map((wp) => {
                const isActive = mode === 'image' && active === wp.path
                const url = wallpaperUrl(wp.path)
                return (
                  <div key={wp.path} className="wp-thumb-wrap" data-wp={wp.path}>
                    <button
                      className={`wp-thumb${isActive ? ' wp-thumb-active' : ''}`}
                      onClick={() => onSetActive(wp.path)}
                    >
                      <img
                        src={url}
                        alt=""
                        loading="lazy"
                        decoding="async"
                        fetchPriority="low"
                        className="wp-thumb-img"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                      {isActive && (
                        <div className="wp-check">
                          <Check size={10} />
                        </div>
                      )}
                      <div className="wp-label">
                        {wp.path.split('/').pop()?.replace(/\.[^.]+$/, '').replace(/_/g, ' ') || wp.path}
                      </div>
                    </button>
                    <button
                      className="wp-hide-btn"
                      title="Remove from gallery"
                      onClick={() => toggleHide(wp.path)}
                    >
                      <Trash size={9} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Load more sentinel */}
          {hasMore && <div className="wp-load-more" />}

          {/* Custom wallpapers */}
          {customWallpapers.length > 0 && (
            <div className="wp-custom-section">
              <div className="wp-custom-label">Uploaded</div>
              <div className="wallpaper-grid">
                {customWallpapers.map((cw, i) => {
                  const isActive = mode === 'image' && active === cw.data
                  return (
                    <div key={i} className="wp-thumb-wrap">
                      <button
                        className={`wp-thumb${isActive ? ' wp-thumb-active' : ''}`}
                        onClick={() => onSetActive(cw.data)}
                      >
                        <img src={cw.data} alt="" loading="lazy" decoding="async" fetchPriority="low" className="wp-thumb-img" />
                        {isActive && (
                          <div className="wp-check">
                            <Check size={10} />
                          </div>
                        )}
                      </button>
                      <button
                        className="wp-hide-btn"
                        title="Delete uploaded"
                        onClick={() => { onDeleteCustom(i); if (active === cw.data) onSetActive(null) }}
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
            className="wp-upload-btn"
            onClick={() => fileRef.current?.click()}
          >
            <Plus size={12} />
            Upload Wallpaper
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="wp-file-input" onChange={handleFile} />
        </div>

        {/* Bottom: opacity slider */}
        {mode === 'image' && (
          <div className="wp-footer">
            <span className="wp-footer-label">Wallpaper</span>
            <input
              type="range" min="0.05" max="0.8" step="0.05" value={opacity}
              onChange={e => onSetOpacity(parseFloat(e.target.value))}
              className="wp-slider"
            />
            <span className="wp-footer-pct">
              {Math.round(opacity * 100)}%
            </span>
            <button
              className="wp-btn wp-btn-sm"
              onClick={() => onSetActive(null)}
            >
              Remove Wallpaper
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
