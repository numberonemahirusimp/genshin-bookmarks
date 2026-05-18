import React, { useMemo, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { Check, Plus, Search, Trash2, X } from './components/ui/Icons'
import { wallpaperUrl } from './data/wallpapers'
import { useWallpaper } from './hooks/useWallpaper'

function WallpaperGalleryPage() {
  const wallpaper = useWallpaper()
  const [search, setSearch] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const visibleWallpapers = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return wallpaper.wallpapers
    return wallpaper.wallpapers.filter(item => item.path.toLowerCase().includes(q))
  }, [search, wallpaper.wallpapers])

  const activeName = wallpaper.active
    ? wallpaper.active.startsWith('data:')
      ? 'Uploaded wallpaper'
      : wallpaper.active.split('/').pop()?.replace(/\.[^.]+$/, '').replace(/_/g, ' ')
    : 'Theme background'

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      const data = reader.result as string
      wallpaper.addCustomWallpaper(file.name, data)
      wallpaper.setActive(data)
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  return (
    <main className="wallpaper-page">
      <section className="wallpaper-page-hero">
        <div>
          <div className="wallpaper-page-kicker">Teyvat Archive</div>
          <h1>Wallpaper Gallery</h1>
          <p>Choose a background from the full collection, then return to the archive when it feels right.</p>
        </div>
        <div className="wallpaper-page-current archive-card">
          <span>Current</span>
          <strong>{activeName}</strong>
          <div>
            <button type="button" onClick={() => wallpaper.setActive(null)}>
              <X size={13} />
              Remove
            </button>
            <button type="button" onClick={() => window.close()}>
              Done
            </button>
          </div>
        </div>
      </section>

      <section className="wallpaper-page-toolbar archive-card">
        <label className="wallpaper-page-search">
          <Search size={15} />
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Search wallpapers"
            autoFocus
          />
        </label>
        <label className="wallpaper-page-opacity">
          <span>Opacity</span>
          <input
            type="range"
            min="0.05"
            max="0.8"
            step="0.05"
            value={wallpaper.opacity}
            onChange={event => wallpaper.setOpacity(parseFloat(event.target.value))}
          />
          <strong>{Math.round(wallpaper.opacity * 100)}%</strong>
        </label>
        <button className="wallpaper-page-upload" type="button" onClick={() => fileRef.current?.click()}>
          <Plus size={14} />
          Upload
        </button>
        <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFile} />
      </section>

      {wallpaper.customWallpapers.length > 0 && (
        <section className="wallpaper-page-section">
          <h2>Uploaded</h2>
          <div className="wallpaper-page-grid">
            {wallpaper.customWallpapers.map((item, index) => {
              const isActive = wallpaper.mode === 'image' && wallpaper.active === item.data
              return (
                <article className={`wallpaper-page-card${isActive ? ' active' : ''}`} key={`${item.name}-${index}`}>
                  <button type="button" onClick={() => wallpaper.setActive(item.data)}>
                    <img src={item.data} alt="" loading="lazy" decoding="async" />
                    {isActive && <span className="wallpaper-page-check"><Check size={13} /></span>}
                  </button>
                  <div>
                    <strong>{item.name}</strong>
                    <button
                      type="button"
                      title="Delete uploaded wallpaper"
                      onClick={() => {
                        wallpaper.deleteCustomWallpaper(index)
                        if (wallpaper.active === item.data) wallpaper.setActive(null)
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}

      <section className="wallpaper-page-section">
        <h2>Built In</h2>
        {visibleWallpapers.length === 0 ? (
          <div className="wallpaper-page-empty archive-card">No wallpapers match that search.</div>
        ) : (
          <div className="wallpaper-page-grid">
            {visibleWallpapers.map(item => {
              const isActive = wallpaper.mode === 'image' && wallpaper.active === item.path
              const name = item.path.split('/').pop()?.replace(/\.[^.]+$/, '').replace(/_/g, ' ') || item.path
              return (
                <article className={`wallpaper-page-card${isActive ? ' active' : ''}`} key={item.path}>
                  <button type="button" onClick={() => wallpaper.setActive(item.path)}>
                    <img
                      src={wallpaperUrl(item.path)}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={event => { (event.currentTarget as HTMLImageElement).style.display = 'none' }}
                    />
                    {isActive && <span className="wallpaper-page-check"><Check size={13} /></span>}
                  </button>
                  <div>
                    <strong>{name}</strong>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WallpaperGalleryPage />
  </React.StrictMode>
)
