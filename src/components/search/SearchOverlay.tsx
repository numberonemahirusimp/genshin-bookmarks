import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useState, useCallback } from 'react'
import { Search, X, ExternalLink, BarChart3 } from '../ui/Icons'
import { Bookmark, Folder } from '../../types'
import { Badge } from '../ui/Badge'
import Fuse from 'fuse.js'

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
  bookmarks: Bookmark[]
  folders: Folder[]
  onOpen: (url: string) => void
  query: string
  onQueryChange: (q: string) => void
}

export function SearchOverlay({ isOpen, onClose, bookmarks, folders, onOpen, query, onQueryChange }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [results, setResults] = useState<Bookmark[]>([])

  const fuse = useRef(new Fuse(bookmarks, { keys: [{ name: 'title', weight: 0.4 }, { name: 'description', weight: 0.3 }, { name: 'url', weight: 0.2 }], threshold: 0.4 }))

  useEffect(() => { fuse.current = new Fuse(bookmarks, { keys: [{ name: 'title', weight: 0.4 }, { name: 'description', weight: 0.3 }, { name: 'url', weight: 0.2 }], threshold: 0.4 }) }, [bookmarks])

  useEffect(() => {
    if (!query.trim()) { setResults(bookmarks.slice(0, 8)); return }
    setResults(fuse.current.search(query).map(r => r.item))
  }, [query, bookmarks])

  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 80) }, [isOpen])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); isOpen ? onClose() : onQueryChange('') }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose, onQueryChange])

  const getFolder = useCallback((id: string | null) => folders.find(f => f.id === id), [folders])
  const hostname = (url: string) => { try { return new URL(url).hostname.replace('www.', '') } catch { return url } }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh]" onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="archive-card relative w-full max-w-2xl mx-4 overflow-hidden"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="corner-ornament corner-ornament-tl" />
            <div className="corner-ornament corner-ornament-tr" />
            <div className="corner-ornament corner-ornament-bl" />
            <div className="corner-ornament corner-ornament-br" />

            <div className="flex items-center gap-4 px-6 py-5 border-b border-[var(--color-border)]">
              <Search size={22} className="text-[var(--color-gold)] shrink-0" />
              <input ref={inputRef} type="text" value={query} onChange={e => onQueryChange(e.target.value)}
                placeholder="Search archives..."
                className="ui-sans flex-1 bg-transparent text-base font-light text-[var(--color-text)] placeholder:text-[var(--color-text-secondary)]/45 outline-none"
              />
              <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/[0.03] transition-colors">
                <X size={18} className="text-[var(--color-text-secondary)]/70" />
              </button>
            </div>

            <div className="max-h-[45vh] overflow-y-auto">
              {results.length === 0 ? (
                <div className="flex flex-col items-center py-14">
                  <div className="w-14 h-14 rounded-2xl border border-dashed border-[var(--color-border)] flex items-center justify-center mb-4">
                    <Search size={20} className="text-[var(--color-text-secondary)]/15" />
                  </div>
                  <p className="text-sm font-light text-[var(--color-text-secondary)]/30">No results for &ldquo;{query}&rdquo;</p>
                </div>
              ) : (
                <div className="py-2">
                  {results.map((bm, i) => (
                    <motion.button
                      key={bm.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.025 }}
                      onClick={() => { onOpen(bm.url); onClose() }}
                      className="w-full text-left px-6 py-3.5 flex items-center gap-4 hover:bg-white/[0.035] transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg border border-[var(--color-border)] bg-black/20 flex items-center justify-center shrink-0">
                        {bm.favicon ? <img src={bm.favicon} alt="" className="w-4 h-4 object-contain" /> : <ExternalLink size={12} className="text-[var(--color-gold)]/30" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-lg font-light text-[var(--color-text)]/90 group-hover:text-[var(--color-gold-light)] transition-colors truncate">{bm.title}</p>
                        <p className="text-[10px] font-light text-[var(--color-text-secondary)]/30 truncate mt-0.5">{hostname(bm.url)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {getFolder(bm.folderId) && <Badge variant="muted" size="sm">{getFolder(bm.folderId)!.name}</Badge>}
                        <span className="flex items-center gap-1 text-[10px] text-[var(--color-text-secondary)]/20"><BarChart3 size={10} />{bm.visitCount}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            <div className="px-5 py-2.5 border-t border-[var(--color-border)] flex items-center gap-4 text-[9px] font-light text-[var(--color-text-secondary)]/20">
              <span><kbd className="px-1 py-0.5 rounded border border-[var(--color-border)] font-mono text-[9px]">↑↓</kbd> Navigate</span>
              <span><kbd className="px-1 py-0.5 rounded border border-[var(--color-border)] font-mono text-[9px]">Esc</kbd> Close</span>
              <span className="ml-auto"><kbd className="px-1 py-0.5 rounded border border-[var(--color-border)] font-mono text-[9px]">⌘K</kbd> Toggle</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
