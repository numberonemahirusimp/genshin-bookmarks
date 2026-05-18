export type BookmarkId = string
export type FolderId = string
export type TagId = string
export type ThemeId = 'mondstadt' | 'liyue' | 'inazuma' | 'sumeru' | 'fontaine' | 'natlan' | 'nodkrai'

export interface Bookmark {
  id: BookmarkId
  title: string
  url: string
  description: string
  favicon: string
  thumbnail: string
  folderId: FolderId | null
  tags: TagId[]
  isFavorite: boolean
  isPinned: boolean
  visitCount: number
  createdAt: number
  updatedAt: number
  lastVisitedAt: number | null
}

export interface Folder {
  id: FolderId
  name: string
  icon: string
  color: string
  parentId: FolderId | null
  order: number
  createdAt: number
  bookmarkCount?: number
}

export interface Tag {
  id: TagId
  name: string
  color: string
}

export interface ThemeConfig {
  id: ThemeId
  name: string
  region: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    surface: string
    surfaceLight: string
    surfaceDark: string
    text: string
    textSecondary: string
    border: string
    glow: string
    cardBg: string
    sidebarBg: string
    headerBg: string
    gold: string
    goldLight: string
    goldDark: string
  }
  particles: {
    color: string
    count: number
    size: [number, number]
    speed: number
  }
  background: string
}

export interface GenshinAuth {
  ltuid: string
  ltoken: string
  uid: string
  ltuid_v2?: string
  ltoken_v2?: string
}

export interface MusicTrack {
  id: string
  title: string
  filename: string
  region: ThemeId
}

export interface MusicState {
  enabled: boolean
  volume: number
  currentTrackIndex: number
  isPlaying: boolean
  shuffle: boolean
  loop: boolean
  customTracks: MusicTrack[]
}

export interface WallpaperEntry {
  path: string
  thumbnail?: string
}

export interface WallpaperState {
  mode: 'theme' | 'image'
  active: string | null
  opacity: number
}

export interface AppState {
  bookmarks: Bookmark[]
  folders: Folder[]
  tags: Tag[]
  activeTheme: ThemeId
  isSearchOpen: boolean
  searchQuery: string
  activeFolderId: FolderId | null
  viewMode: 'grid' | 'list'
  sortBy: 'title' | 'createdAt' | 'lastVisitedAt' | 'visitCount'
  sortOrder: 'asc' | 'desc'
}
