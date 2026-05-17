import { motion } from 'framer-motion'
import { Bookmark as BookmarkType, Folder } from '../../types'
import { ExternalLink, Heart, Pin, Trash2, Globe } from '../ui/Icons'

interface BookmarkCardProps {
  bookmark: BookmarkType
  folder?: Folder
  onOpen: (url: string) => void
  onToggleFavorite: (id: string) => void
  onTogglePinned: (id: string) => void
  onDelete: (id: string) => void
  index: number
}

export function BookmarkCard({
  bookmark,
  folder,
  onOpen,
  onToggleFavorite,
  onTogglePinned,
  onDelete,
  index,
}: BookmarkCardProps) {
  const hostname = (() => {
    try { return new URL(bookmark.url).hostname.replace('www.', '') } catch { return bookmark.url }
  })()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
      className="genshin-card cursor-pointer"
      onClick={() => onOpen(bookmark.url)}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Favicon */}
          <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(229,194,137,0.22)' }}>
            {bookmark.favicon ? (
              <img src={bookmark.favicon} alt="" className="w-6 h-6 object-contain" />
            ) : (
              <Globe size={18} style={{ color: 'rgba(229,194,137,0.78)' }} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-light leading-snug" style={{ color: 'rgba(255,249,237,0.94)' }}>
                  {bookmark.title}
                </h3>
                <p className="ui-sans text-[11px] font-light mt-1" style={{ color: 'rgba(229,194,137,0.58)' }}>
                  {hostname}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(bookmark.id) }}
              className="p-1.5 rounded-lg transition-all duration-200"
              style={{
                color: bookmark.isFavorite ? 'rgba(255, 194, 194, 0.82)' : 'rgba(242,229,204,0.42)',
                background: bookmark.isFavorite ? 'rgba(248, 113, 113, 0.08)' : 'transparent',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = bookmark.isFavorite ? 'rgba(248, 113, 113, 0.55)' : 'rgba(212,163,90,0.3)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = bookmark.isFavorite ? 'rgba(248, 113, 113, 0.55)' : 'rgba(212,163,90,0.15)' }}
            >
              <Heart size={12} fill={bookmark.isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onTogglePinned(bookmark.id) }}
              className="p-1.5 rounded-lg transition-all duration-200"
              style={{
                color: bookmark.isPinned ? 'rgba(229, 194, 137, 0.92)' : 'rgba(242,229,204,0.42)',
                background: bookmark.isPinned ? 'rgba(229, 194, 137, 0.1)' : 'transparent',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = bookmark.isPinned ? 'rgba(212, 163, 90, 0.45)' : 'rgba(212,163,90,0.3)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = bookmark.isPinned ? 'rgba(212, 163, 90, 0.45)' : 'rgba(212,163,90,0.15)' }}
            >
              <Pin size={12} fill={bookmark.isPinned ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(bookmark.id) }}
              className="p-1.5 rounded-lg transition-all duration-200"
              style={{ color: 'rgba(242,229,204,0.42)' }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(248, 113, 113, 0.4)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(212,163,90,0.15)'}
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Description */}
        {bookmark.description && (
          <p className="ui-sans mt-2 text-[11px] font-light leading-relaxed line-clamp-1" style={{ color: 'rgba(216,200,175,0.58)' }}>
            {bookmark.description}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-2" style={{ borderTop: '1px solid rgba(229,194,137,0.12)' }}>
          <div className="flex items-center gap-2">
            {folder && (
              <span className="ui-sans text-[10px] font-light px-2 py-0.5 rounded" style={{ background: 'rgba(229,194,137,0.08)', border: '1px solid rgba(229,194,137,0.18)', color: 'rgba(229,194,137,0.8)' }}>
                {folder.name}
              </span>
            )}
          </div>
          <div className="ui-sans flex items-center gap-2 text-[10px] font-light" style={{ color: 'rgba(255,240,210,0.55)' }}>
            <span>{bookmark.visitCount} visits</span>
            <ExternalLink size={9} style={{ opacity: 0 }} className="group-hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
