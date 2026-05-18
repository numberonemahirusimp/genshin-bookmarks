import { useState, useCallback, useEffect } from 'react'
import { Header } from './Header'
import { Dock, DockView } from './Dock'
import { BookmarkGrid } from '../bookmarks/BookmarkGrid'
import { HomePage } from '../home/HomePage'
import { SearchOverlay } from '../search/SearchOverlay'
import { ThemeSwitcher } from '../themes/ThemeSwitcher'
import { GenshinDashboard } from '../genshin/GenshinDashboard'
import { HistoryView } from '../history/HistoryView'
import { NewsFeed } from '../news/NewsFeed'
import { Bookmark, Folder, Tag, ThemeId } from '../../types'
import { GenshinAuth } from '../../services/genshinApi'
import { useWallpaper } from '../../hooks/useWallpaper'
interface MainLayoutProps {
  bookmarks: Bookmark[]
  folders: Folder[]
  tags: Tag[]
  filteredBookmarks: Bookmark[]
  pinnedBookmarks: Bookmark[]
  favoriteBookmarks: Bookmark[]
  recentBookmarks: Bookmark[]
  activeFolderId: string | null
  viewMode: 'grid' | 'list'
  isSearchOpen: boolean
  searchQuery: string
  activeTheme: ThemeId
  genshinAuth: GenshinAuth | null
  onOpen: (url: string) => void
  onToggleFavorite: (id: string) => void
  onTogglePinned: (id: string) => void
  onDelete: (id: string) => void
  onSelectFolder: (id: string | null) => void
  onViewModeChange: (mode: 'grid' | 'list') => void
  onSearchOpen: () => void
  onSearchClose: () => void
  onSearchQuery: (q: string) => void
  onThemeChange: (theme: ThemeId) => void
  onGenshinAuthChange: (auth: GenshinAuth | null) => void
}

export function MainLayout({
  bookmarks,
  folders,
  filteredBookmarks,
  pinnedBookmarks,
  favoriteBookmarks,
  recentBookmarks,
  activeFolderId,
  viewMode,
  isSearchOpen,
  searchQuery,
  activeTheme,
  genshinAuth,
  onOpen,
  onToggleFavorite,
  onTogglePinned,
  onDelete,
  onSelectFolder,
  onViewModeChange,
  onSearchOpen,
  onSearchClose,
  onSearchQuery,
  onThemeChange,
  onGenshinAuthChange,
}: MainLayoutProps) {
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const [dockView, setDockView] = useState<DockView>('home')
  const wallpaper = useWallpaper()

  const openWallpaperGallery = useCallback(() => {
    const url = typeof chrome !== 'undefined' && chrome.runtime?.getURL
      ? chrome.runtime.getURL('wallpapers.html')
      : '/wallpapers.html'
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  const handleDockChange = useCallback((view: DockView) => {
    setDockView(view)
  }, [])

  const totalVisits = bookmarks.reduce((sum, b) => sum + b.visitCount, 0)
  const getFolder = (id: string | null) => folders.find(f => f.id === id)

  useEffect(() => {
    if (wallpaper.currentUrl) {
      document.body.classList.add('wallpaper-active')
      extractThemeColors(wallpaper.currentUrl)
    } else {
      document.body.classList.remove('wallpaper-active')
      resetThemeColors()
    }

    return () => {
      document.body.classList.remove('wallpaper-active')
      resetThemeColors()
    }
  }, [wallpaper.currentUrl])

  const renderContent = () => {
    switch (dockView) {
      case 'home':
        return (
          <HomePage
            bookmarks={bookmarks}
            favoriteBookmarks={favoriteBookmarks}
            recentBookmarks={recentBookmarks}
            totalVisits={totalVisits}
            genshinAuth={genshinAuth}
            activeTheme={activeTheme}
            onThemeChange={onThemeChange}
            isThemeOpen={themeMenuOpen}
            onThemeToggle={() => setThemeMenuOpen(!themeMenuOpen)}
            onOpenWidget={() => {}}
          />
        )

      case 'bookmarks':
        return (
          <div className="archive-page">
            <div className="w-full max-w-6xl mx-auto">
              {/* Folder filter */}
              <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none"
                style={{ scrollbarWidth: 'none' }}>
                <button
                  onClick={() => onSelectFolder(null)}
                  className="text-xs font-light px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-200"
                  style={{
                    background: !activeFolderId ? 'rgba(212,163,90,0.05)' : 'transparent',
                    color: !activeFolderId ? 'rgba(240,235,228,0.55)' : 'rgba(196,181,165,0.25)',
                    border: !activeFolderId ? '1px solid rgba(212,163,90,0.12)' : '1px solid transparent',
                    fontFamily: "'Cormorant Garamond', serif",
                  }}
                >
                  All
                </button>
                {folders.map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => onSelectFolder(folder.id)}
                    className="text-xs font-light px-3 py-1.5 rounded-lg whitespace-nowrap transition-all duration-200"
                    style={{
                      background: activeFolderId === folder.id ? 'rgba(212,163,90,0.05)' : 'transparent',
                      color: activeFolderId === folder.id ? 'rgba(240,235,228,0.55)' : 'rgba(196,181,165,0.25)',
                      border: activeFolderId === folder.id ? '1px solid rgba(212,163,90,0.12)' : '1px solid transparent',
                      fontFamily: "'Cormorant Garamond', serif",
                    }}
                  >
                    {folder.name}
                  </button>
                ))}
              </div>
              <BookmarkGrid
                bookmarks={activeFolderId ? filteredBookmarks : bookmarks}
                folders={folders}
                onOpen={onOpen}
                onToggleFavorite={onToggleFavorite}
                onTogglePinned={onTogglePinned}
                onDelete={onDelete}
              />
            </div>
          </div>
        )

      case 'favorites':
        return (
          <div className="archive-page">
            <div className="w-full max-w-6xl mx-auto">
              <BookmarkGrid
                bookmarks={favoriteBookmarks}
                folders={folders}
                onOpen={onOpen}
                onToggleFavorite={onToggleFavorite}
                onTogglePinned={onTogglePinned}
                onDelete={onDelete}
              />
            </div>
          </div>
        )

      case 'recent':
        return (
          <div className="archive-page">
            <div className="w-full max-w-4xl mx-auto">
              <HistoryView folders={folders} />
            </div>
          </div>
        )

      case 'feed':
        return <NewsFeed />

      case 'genshin':
        return (
          <div className="pt-16 px-4 sm:px-6 pb-28">
            <div className="w-full max-w-6xl mx-auto">
              <GenshinDashboard auth={genshinAuth} onAuthChange={onGenshinAuthChange} />
            </div>
          </div>
        )
    }
  }

  const getTitle = () => {
    switch (dockView) {
      case 'home': return ''
      case 'bookmarks': return 'Bookmarks'
      case 'favorites': return 'Favorites'
      case 'recent': return 'Recent'
      case 'feed': return ''
      case 'genshin': return ''
    }
  }

  return (
    <div className="archive-shell flex flex-col min-h-screen">
      {wallpaper.currentUrl && (
        <WallpaperBackdrop url={wallpaper.currentUrl} opacity={wallpaper.opacity} />
      )}

      {/* Theme Switcher */}
      {dockView !== 'home' && (
      <div className="fixed top-5 right-6 z-[80]">
        <ThemeSwitcher
          activeTheme={activeTheme}
          onSelect={onThemeChange}
          isOpen={themeMenuOpen}
          onToggle={() => setThemeMenuOpen(!themeMenuOpen)}
        />
      </div>
      )}

      {/* Header (only shown for bookmark views) */}
      {dockView !== 'home' && dockView !== 'genshin' && dockView !== 'feed' && (
        <Header
          title={getTitle()}
          subtitle={activeFolderId ? folders.find(f => f.id === activeFolderId)?.name : undefined}
          count={dockView === 'favorites' ? favoriteBookmarks.length : dockView === 'recent' ? recentBookmarks.length : activeFolderId ? filteredBookmarks.length : bookmarks.length}
          onSearchOpen={onSearchOpen}
          onThemeToggle={() => setThemeMenuOpen(!themeMenuOpen)}
        />
      )}

      {/* Content */}
      <div key={dockView} className="flex-1 overflow-y-auto" onClick={() => setThemeMenuOpen(false)}>
        {renderContent()}
      </div>

      {/* Dock */}
      <Dock
        activeView={dockView}
        onViewChange={handleDockChange}
        hasGenshinAuth={!!genshinAuth}
        themeId={activeTheme}
      />

      {/* Floating wallpaper button */}
      <button
        onClick={openWallpaperGallery}
        title="Wallpaper gallery"
        style={{
          position: 'fixed', bottom: 88, right: 22, zIndex: 45,
          width: 38, height: 38, borderRadius: '50%', cursor: 'pointer',
          background: wallpaper.mode === 'image' ? 'var(--wallpaper-control-active)' : 'var(--wallpaper-control-bg)',
          color: wallpaper.mode === 'image' ? 'var(--color-gold-light)' : 'var(--color-text-secondary)',
          backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--wallpaper-control-active)'; e.currentTarget.style.color = 'var(--color-gold-light)' }}
        onMouseLeave={e => { e.currentTarget.style.background = wallpaper.mode === 'image' ? 'var(--wallpaper-control-active)' : 'var(--wallpaper-control-bg)'; e.currentTarget.style.color = wallpaper.mode === 'image' ? 'var(--color-gold-light)' : 'var(--color-text-secondary)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </button>

      {/* Search */}
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={onSearchClose}
        bookmarks={bookmarks}
        folders={folders}
        onOpen={onOpen}
        query={searchQuery}
        onQueryChange={onSearchQuery}
      />
    </div>
  )
}

function WallpaperBackdrop({ url, opacity }: { url: string; opacity: number }) {
  return (
    <div className="wallpaper-backdrop" aria-hidden="true">
      <img
        src={url}
        alt=""
        className="wallpaper-backdrop-image"
        style={{ opacity: Math.max(0.25, Math.min(1, opacity + 0.35)) }}
      />
      <div className="wallpaper-backdrop-scrim" />
    </div>
  )
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b)
  let h = 0, s = 0, l = (mx + mn) / 2
  if (mx !== mn) {
    const d = mx - mn
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn)
    switch (mx) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return [h * 360, s, l]
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h * 12) % 12
    const c = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * c).toString(16).padStart(2, '0')
  }
  return `#${f(0)}${f(8)}${f(4)}`
}

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return rgbToHsl(r, g, b)
}

function cs(s: number): number { return Math.max(0, Math.min(1, s)) }

function extractThemeColors(url: string) {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    const canvas = document.createElement('canvas')
    const size = 100
    canvas.width = size; canvas.height = size
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0, size, size)
    const data = ctx.getImageData(0, 0, size, size).data
    let warmH = 0, warmS = 0, warmL = 0, warmN = 0
    let coolH = 0, coolS = 0, coolL = 0, coolN = 0
    let tr = 0, tg = 0, tb = 0, n = 0
    let bright = 0
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i], g = data[i + 1], b = data[i + 2]
      tr += r; tg += g; tb += b; n++
      const [h, s, l] = rgbToHsl(r, g, b)
      bright += l
      if (s > 0.08) {
        if (h >= 20 && h <= 50) { warmH += h; warmS += s; warmL += l; warmN++ }
        else if (h >= 170 && h <= 240) { coolH += h; coolS += s; coolL += l; coolN++ }
      }
    }
    const [ah, as, al] = rgbToHsl(tr / n, tg / n, tb / n)
    const accent = warmN > 0
      ? hslToHex(warmH / warmN, cs(warmS / warmN + 0.15), cs(warmL / warmN + 0.15))
      : hslToHex(ah + 30, cs(as + 0.3), cs(al + 0.3))
    const primary = coolN > 0
      ? hslToHex(coolH / coolN, cs(coolS / coolN + 0.2), cs(coolL / coolN + 0.15))
      : hslToHex(ah + 180, cs(as + 0.2), cs(al + 0.25))
    const [accH, accS] = hexToHsl(accent)
    const averageLightness = bright / n
    const panelAlpha = averageLightness > 0.55 ? 0.82 : 0.68
    const scrimAlpha = averageLightness > 0.62 ? 0.66 : averageLightness > 0.45 ? 0.54 : 0.44
    const root = document.documentElement
    root.style.setProperty('--color-gold', accent)
    root.style.setProperty('--color-gold-light', hslToHex(accH, cs(accS + 0.15), 0.6))
    root.style.setProperty('--color-gold-dark', hslToHex(accH, cs(accS + 0.1), 0.3))
    root.style.setProperty('--color-primary', primary)
    root.style.setProperty('--color-accent', primary)
    root.style.setProperty('--color-text', '#fff8ec')
    root.style.setProperty('--color-text-secondary', '#eadbc5')
    root.style.setProperty('--color-border', `color-mix(in srgb, ${accent} 46%, rgba(255,255,255,0.18))`)
    root.style.setProperty('--color-glow', `color-mix(in srgb, ${accent} 28%, transparent)`)
    root.style.setProperty('--color-card-bg', `rgba(5, 12, 18, ${panelAlpha})`)
    root.style.setProperty('--color-surface', `rgba(5, 12, 18, ${panelAlpha})`)
    root.style.setProperty('--wallpaper-panel-bg', `linear-gradient(180deg, rgba(255,255,255,0.09), rgba(255,255,255,0.025)), rgba(5, 12, 18, ${panelAlpha})`)
    root.style.setProperty('--wallpaper-control-bg', `rgba(5, 12, 18, ${Math.min(0.72, panelAlpha)})`)
    root.style.setProperty('--wallpaper-control-active', `color-mix(in srgb, ${accent} 24%, rgba(5, 12, 18, 0.72))`)
    root.style.setProperty('--wallpaper-scrim-alpha', String(scrimAlpha))
  }
  img.src = url
}

function resetThemeColors() {
  const root = document.documentElement
  for (const key of ['--color-gold', '--color-gold-light', '--color-gold-dark', '--color-primary', '--color-accent', '--color-text', '--color-text-secondary', '--color-border', '--color-glow', '--color-card-bg', '--color-surface', '--wallpaper-panel-bg', '--wallpaper-control-bg', '--wallpaper-control-active', '--wallpaper-scrim-alpha']) {
    root.style.removeProperty(key)
  }
}
