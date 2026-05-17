import { useState, useEffect, useCallback } from 'react'
import { Bookmark, Folder, Tag, AppState } from '../types'
import { db } from '../store'

export function useBookmarks() {
  const [state, setState] = useState<AppState>({
    bookmarks: [],
    folders: [],
    tags: [],
    activeTheme: 'mondstadt',
    isSearchOpen: false,
    searchQuery: '',
    activeFolderId: null,
    viewMode: 'grid',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      try {
        const bookmarks = await db.getAllBookmarks()
        const folders = await db.getAllFolders()
        const tags = await db.getAllTags()
        setState(prev => ({ ...prev, bookmarks, folders, tags }))
      } catch (err) {
        console.error('Failed to load data:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const addBookmark = useCallback(async (bookmark: Bookmark) => {
    await db.addBookmark(bookmark)
    setState(prev => ({ ...prev, bookmarks: [...prev.bookmarks, bookmark] }))
  }, [])

  const updateBookmark = useCallback(async (bookmark: Bookmark) => {
    await db.updateBookmark(bookmark)
    setState(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.map(b => b.id === bookmark.id ? bookmark : b),
    }))
  }, [])

  const deleteBookmark = useCallback(async (id: string) => {
    await db.deleteBookmark(id)
    setState(prev => ({
      ...prev,
      bookmarks: prev.bookmarks.filter(b => b.id !== id),
    }))
  }, [])

  const toggleFavorite = useCallback(async (id: string) => {
    const bm = state.bookmarks.find(b => b.id === id)
    if (bm) {
      await updateBookmark({ ...bm, isFavorite: !bm.isFavorite })
    }
  }, [state.bookmarks, updateBookmark])

  const togglePinned = useCallback(async (id: string) => {
    const bm = state.bookmarks.find(b => b.id === id)
    if (bm) {
      await updateBookmark({ ...bm, isPinned: !bm.isPinned })
    }
  }, [state.bookmarks, updateBookmark])

  const incrementVisit = useCallback(async (id: string) => {
    const bm = state.bookmarks.find(b => b.id === id)
    if (bm) {
      await updateBookmark({
        ...bm,
        visitCount: bm.visitCount + 1,
        lastVisitedAt: Date.now(),
      })
    }
  }, [state.bookmarks, updateBookmark])

  const setSortBy = useCallback((sortBy: AppState['sortBy']) => {
    setState(prev => ({ ...prev, sortBy }))
  }, [])

  const setSortOrder = useCallback((sortOrder: AppState['sortOrder']) => {
    setState(prev => ({ ...prev, sortOrder }))
  }, [])

  const setActiveFolder = useCallback((folderId: string | null) => {
    setState(prev => ({ ...prev, activeFolderId: folderId }))
  }, [])

  const setViewMode = useCallback((viewMode: 'grid' | 'list') => {
    setState(prev => ({ ...prev, viewMode }))
  }, [])

  const setSearchOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, isSearchOpen: open }))
  }, [])

  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }))
  }, [])

  const sortedBookmarks = [...state.bookmarks].sort((a, b) => {
    let cmp = 0
    switch (state.sortBy) {
      case 'title': cmp = a.title.localeCompare(b.title); break
      case 'createdAt': cmp = a.createdAt - b.createdAt; break
      case 'lastVisitedAt': cmp = (a.lastVisitedAt || 0) - (b.lastVisitedAt || 0); break
      case 'visitCount': cmp = a.visitCount - b.visitCount; break
    }
    return state.sortOrder === 'desc' ? -cmp : cmp
  })

  const filteredBookmarks = state.activeFolderId
    ? sortedBookmarks.filter(b => b.folderId === state.activeFolderId)
    : sortedBookmarks

  const pinnedBookmarks = state.bookmarks.filter(b => b.isPinned)
  const favoriteBookmarks = state.bookmarks.filter(b => b.isFavorite)
  const recentBookmarks = [...state.bookmarks]
    .filter(b => b.lastVisitedAt)
    .sort((a, b) => (b.lastVisitedAt || 0) - (a.lastVisitedAt || 0))
    .slice(0, 8)

  return {
    ...state,
    loading,
    filteredBookmarks,
    pinnedBookmarks,
    favoriteBookmarks,
    recentBookmarks,
    addBookmark,
    updateBookmark,
    deleteBookmark,
    toggleFavorite,
    togglePinned,
    incrementVisit,
    setSortBy,
    setSortOrder,
    setActiveFolder,
    setViewMode,
    setSearchOpen,
    setSearchQuery,
  }
}
