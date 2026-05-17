import { useState, useCallback, useEffect } from 'react'
import { MainLayout } from './components/layout/MainLayout'
import { LoadingScreen } from './components/ui/LoadingScreen'
import { ParticleBackground } from './components/ui/ParticleBackground'
import { useBookmarks } from './hooks/useBookmarks'
import { useTheme } from './hooks/useTheme'
import { ThemeId, GenshinAuth } from './types'
import { db } from './store'

export default function App() {
  const {
    bookmarks,
    folders,
    tags,
    filteredBookmarks,
    pinnedBookmarks,
    favoriteBookmarks,
    recentBookmarks,
    activeFolderId,
    viewMode,
    isSearchOpen,
    searchQuery,
    loading,
    toggleFavorite,
    togglePinned,
    deleteBookmark,
    setActiveFolder,
    setViewMode,
    setSearchOpen,
    setSearchQuery,
  } = useBookmarks()

  const [activeTheme, setActiveTheme] = useState<ThemeId>('mondstadt')
  const [genshinAuth, setGenshinAuth] = useState<GenshinAuth | null>(null)
  useTheme(activeTheme, setActiveTheme)

  useEffect(() => {
    db.getSetting('genshinAuth').then(auth => {
      if (auth) setGenshinAuth(auth)
    }).catch(() => {})
  }, [])

  const handleOpen = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  const handleThemeChange = useCallback((theme: ThemeId) => {
    setActiveTheme(theme)
  }, [])

  const handleGenshinAuthChange = useCallback((auth: GenshinAuth | null) => {
    setGenshinAuth(auth)
  }, [])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <div className="relative">
      <ParticleBackground />
      <MainLayout
        bookmarks={bookmarks}
        folders={folders}
        tags={tags}
        filteredBookmarks={filteredBookmarks}
        pinnedBookmarks={pinnedBookmarks}
        favoriteBookmarks={favoriteBookmarks}
        recentBookmarks={recentBookmarks}
        activeFolderId={activeFolderId}
        viewMode={viewMode}
        isSearchOpen={isSearchOpen}
        searchQuery={searchQuery}
        activeTheme={activeTheme}
        genshinAuth={genshinAuth}
        onOpen={handleOpen}
        onToggleFavorite={toggleFavorite}
        onTogglePinned={togglePinned}
        onDelete={deleteBookmark}
        onSelectFolder={setActiveFolder}
        onViewModeChange={setViewMode}
        onSearchOpen={() => setSearchOpen(true)}
        onSearchClose={() => setSearchOpen(false)}
        onSearchQuery={setSearchQuery}
        onThemeChange={handleThemeChange}
        onGenshinAuthChange={handleGenshinAuthChange}
      />
    </div>
  )
}
