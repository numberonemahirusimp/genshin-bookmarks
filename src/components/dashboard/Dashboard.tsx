import { motion } from 'framer-motion'
import { Bookmark, Folder } from '../../types'
import { FantasyPanel } from '../ui/FantasyPanel'
import { Badge } from '../ui/Badge'
import { GoldDivider } from '../ui/GoldDivider'
import { BookmarkCard } from '../bookmarks/BookmarkCard'
import {
  Archive, Heart, Pin, BarChart3, Clock,
} from '../ui/Icons'

interface DashboardProps {
  recentBookmarks: Bookmark[]
  favoriteBookmarks: Bookmark[]
  pinnedBookmarks: Bookmark[]
  bookmarks: Bookmark[]
  folders: Folder[]
  onOpen: (url: string) => void
  onToggleFavorite: (id: string) => void
  onTogglePinned: (id: string) => void
  onDelete: (id: string) => void
  onSelectFolder: (id: string) => void
}

export function Dashboard({
  recentBookmarks,
  favoriteBookmarks,
  pinnedBookmarks,
  bookmarks,
  folders,
  onOpen,
  onToggleFavorite,
  onTogglePinned,
  onDelete,
  onSelectFolder,
}: DashboardProps) {
  const totalVisits = bookmarks.reduce((sum, b) => sum + b.visitCount, 0)
  const mostVisited = [...bookmarks].sort((a, b) => b.visitCount - a.visitCount).slice(0, 4)
  const getFolder = (id: string | null) => folders.find(f => f.id === id)

  const stats = [
    { icon: Archive, label: 'Archived', value: bookmarks.length, color: '#5ca9c2' },
    { icon: Heart, label: 'Favorites', value: favoriteBookmarks.length, color: '#e9bd83' },
    { icon: Pin, label: 'Pinned', value: pinnedBookmarks.length, color: '#d4a35a' },
    { icon: BarChart3, label: 'Visits', value: totalVisits, color: '#85d185' },
  ]

  return (
    <div className="px-10 pb-24 space-y-8">
      {/* Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {stats.map((stat, i) => (
          <FantasyPanel key={stat.label} delay={i * 0.08} className="p-5" withCorners={false}>
            <div className="flex items-center gap-4">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${stat.color}08`, border: `1px solid ${stat.color}15` }}
              >
                <stat.icon size={16} style={{ color: stat.color }} />
              </div>
              <div>
                <p className="font-display text-xl font-light text-[var(--color-text)] leading-none">{stat.value}</p>
                <p className="text-[10px] font-light text-[var(--color-text-secondary)]/40 mt-1 tracking-wider uppercase">{stat.label}</p>
              </div>
            </div>
          </FantasyPanel>
        ))}
      </motion.div>

      {/* Most Visited */}
      <FantasyPanel delay={0.2} className="p-6" withCorners>
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 size={14} className="text-[var(--color-gold)]/40" />
          <h2 className="font-display text-sm font-medium text-[var(--color-text)]/80 tracking-wide">Most Visited</h2>
        </div>
        <div className="space-y-1">
          {mostVisited.map((bm, i) => (
            <button
              key={bm.id}
              onClick={() => onOpen(bm.url)}
              className="w-full flex items-center gap-4 px-4 py-2.5 rounded-xl hover:bg-white/[0.02] transition-colors group"
            >
              <span className="font-display text-sm text-[var(--color-text-secondary)]/15 w-5 text-right font-light">{i + 1}</span>
              <div className="w-7 h-7 rounded-lg border border-[var(--color-border)] bg-black/15 flex items-center justify-center shrink-0">
                {bm.favicon && <img src={bm.favicon} alt="" className="w-4 h-4 object-contain" />}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-xs text-[var(--color-text)]/70 group-hover:text-[var(--color-gold-light)]/80 transition-colors truncate font-light">
                  {bm.title}
                </p>
              </div>
              <span className="text-[10px] font-light text-[var(--color-text-secondary)]/30 tabular-nums">{bm.visitCount}</span>
            </button>
          ))}
        </div>
      </FantasyPanel>

      {/* Pinned */}
      {pinnedBookmarks.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-4 px-1">
            <Pin size={13} className="text-[var(--color-gold)]/50" />
            <h2 className="font-display text-sm font-medium text-[var(--color-text)]/70 tracking-wide">Pinned</h2>
          </div>
          <div className="card-grid">
            {pinnedBookmarks.slice(0, 4).map((bm, i) => (
              <BookmarkCard key={bm.id} bookmark={bm} folder={getFolder(bm.folderId)} onOpen={onOpen} onToggleFavorite={onToggleFavorite} onTogglePinned={onTogglePinned} onDelete={onDelete} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Recent */}
      <section>
        <div className="flex items-center gap-2 mb-4 px-1">
          <Clock size={13} className="text-[var(--color-text-secondary)]/30" />
          <h2 className="font-display text-sm font-medium text-[var(--color-text)]/70 tracking-wide">Recently Visited</h2>
        </div>
        {recentBookmarks.length > 0 ? (
          <div className="card-grid">
            {recentBookmarks.slice(0, 4).map((bm, i) => (
              <BookmarkCard key={bm.id} bookmark={bm} folder={getFolder(bm.folderId)} onOpen={onOpen} onToggleFavorite={onToggleFavorite} onTogglePinned={onTogglePinned} onDelete={onDelete} index={i} />
            ))}
          </div>
        ) : (
          <FantasyPanel className="p-10 text-center" withCorners={false}>
            <p className="text-sm font-light text-[var(--color-text-secondary)]/25">No bookmarks visited yet</p>
          </FantasyPanel>
        )}
      </section>

      {/* Folders */}
      <section>
        <div className="flex items-center gap-2 mb-4 px-1">
          <Archive size={13} className="text-[var(--color-text-secondary)]/30" />
          <h2 className="font-display text-sm font-medium text-[var(--color-text)]/70 tracking-wide">Collections</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {folders.map((folder, i) => (
            <FantasyPanel key={folder.id} delay={i * 0.04} onClick={() => onSelectFolder(folder.id)} hover className="p-4 text-center" withCorners={false}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: `${folder.color}08`, border: `1px solid ${folder.color}15` }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={folder.color} strokeWidth="1.5" opacity="0.6">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              <p className="text-xs font-light text-[var(--color-text)]/70 truncate">{folder.name}</p>
              <p className="text-[9px] font-light text-[var(--color-text-secondary)]/30 mt-1">{bookmarks.filter(b => b.folderId === folder.id).length} items</p>
            </FantasyPanel>
          ))}
        </div>
      </section>
    </div>
  )
}
