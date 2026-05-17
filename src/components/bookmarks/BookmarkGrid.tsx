import { motion } from 'framer-motion'
import { Bookmark as BookmarkType, Folder } from '../../types'
import { BookmarkCard } from './BookmarkCard'
import { Archive } from '../ui/Icons'

interface BookmarkGridProps {
  bookmarks: BookmarkType[]
  folders: Folder[]
  onOpen: (url: string) => void
  onToggleFavorite: (id: string) => void
  onTogglePinned: (id: string) => void
  onDelete: (id: string) => void
}

export function BookmarkGrid({
  bookmarks,
  folders,
  onOpen,
  onToggleFavorite,
  onTogglePinned,
  onDelete,
}: BookmarkGridProps) {
  const getFolder = (folderId: string | null) => folders.find(f => f.id === folderId)

  if (bookmarks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="w-14 h-14 rounded-2xl border border-dashed border-[var(--color-border)] flex items-center justify-center mb-4">
          <Archive size={22} className="text-[var(--color-text-secondary)]/15" />
        </div>
        <p className="font-display text-base font-light" style={{ color: 'rgba(141, 150, 171, 0.35)' }}>
          No bookmarks found
        </p>
        <p className="text-xs font-light mt-1" style={{ color: 'rgba(141, 150, 171, 0.2)' }}>
          Your collection awaits
        </p>
      </motion.div>
    )
  }

  return (
    <div className="card-grid">
      {bookmarks.map((bm, i) => (
        <BookmarkCard
          key={bm.id}
          bookmark={bm}
          folder={getFolder(bm.folderId)}
          onOpen={onOpen}
          onToggleFavorite={onToggleFavorite}
          onTogglePinned={onTogglePinned}
          onDelete={onDelete}
          index={i}
        />
      ))}
    </div>
  )
}
