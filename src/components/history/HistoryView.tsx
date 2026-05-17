import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, Folder } from '../../types'
import { db } from '../../store'
import { Globe, BookmarkPlus, ExternalLink, Clock } from '../ui/Icons'

interface HistoryItem {
  id: string
  url: string
  title: string
  lastVisitTime: number
  visitCount: number
  typedCount: number
}

interface HistoryViewProps {
  folders: Folder[]
}

export function HistoryView({ folders }: HistoryViewProps) {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.history) {
      setLoading(false)
      return
    }
    chrome.history.search({
      text: '',
      maxResults: 50,
      startTime: Date.now() - 7 * 86400000,
    }, (items) => {
      const mapped: HistoryItem[] = items
        .filter(item => item.url && !item.url.startsWith('chrome://') && !item.url.startsWith('about:'))
        .map(item => ({
          id: item.id || String(Math.random()),
          url: item.url || '',
          title: item.title || item.url || 'Untitled',
          lastVisitTime: item.lastVisitTime || 0,
          visitCount: item.visitCount || 0,
          typedCount: item.typedCount || 0,
        }))
      setHistory(mapped)
      setLoading(false)
    })
  }, [])

  async function saveAsBookmark(item: HistoryItem, e: React.MouseEvent) {
    e.stopPropagation()
    if (saving) return
    setSaving(item.id)
    try {
      const bookmark: Bookmark = {
        id: `bm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: item.title,
        url: item.url,
        description: '',
        favicon: '',
        thumbnail: '',
        folderId: folders.length > 0 ? folders[0].id : null,
        tags: [],
        isFavorite: false,
        isPinned: false,
        visitCount: 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastVisitedAt: Date.now(),
      }
      await db.addBookmark(bookmark)
      setSaved(item.id)
      setTimeout(() => setSaved(null), 2000)
    } catch {}
    setSaving(null)
  }

  const hostname = (url: string) => {
    try { return new URL(url).hostname.replace('www.', '') } catch { return url }
  }

  const timeAgo = (ts: number) => {
    const diff = Date.now() - ts
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid rgba(212,163,90,0.1)', borderTopColor: 'rgba(212,163,90,0.4)', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div style={{ width: 48, height: 48, borderRadius: 14, border: '1px dashed rgba(212,163,90,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Clock size={22} style={{ color: 'rgba(141,150,171,0.15)' }} />
        </div>
        <p style={{ fontSize: 14, fontWeight: 300, color: 'rgba(141,150,171,0.35)' }}>No recent history</p>
        <p style={{ fontSize: 11, fontWeight: 300, marginTop: 4, color: 'rgba(141,150,171,0.2)' }}>Browse the web and come back</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ paddingBottom: 24 }}>
        <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, color: 'rgba(242,229,204,0.75)', margin: 0 }}>
          Recent
        </h1>
        <p style={{ fontSize: 12, color: 'rgba(141,150,171,0.35)', marginTop: 4, fontWeight: 300 }}>
          Your last 7 days of browsing
        </p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {history.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: i * 0.008 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px',
              borderRadius: 10, cursor: 'pointer', transition: 'background 0.2s',
            }}
            onClick={() => window.open(item.url, '_blank')}
            onMouseEnter={(e) => (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.015)'}
            onMouseLeave={(e) => (e.currentTarget as HTMLDivElement).style.background = 'none'}
          >
            <div style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(212,163,90,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(0,0,0,0.15)' }}>
              <Globe size={14} style={{ color: 'rgba(212,163,90,0.3)' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 300, color: 'rgba(255,255,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item.title}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <span style={{ fontSize: 10, color: 'rgba(141,150,171,0.3)', fontWeight: 300 }}>{hostname(item.url)}</span>
                <span style={{ fontSize: 9, color: 'rgba(141,150,171,0.2)', fontWeight: 300 }}>·</span>
                <span style={{ fontSize: 9, color: 'rgba(141,150,171,0.2)', fontWeight: 300 }}>{timeAgo(item.lastVisitTime)}</span>
              </div>
            </div>
            <button
              onClick={(e) => saveAsBookmark(item, e)}
              disabled={saving === item.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px', borderRadius: 6,
                fontSize: 10, fontWeight: 300, cursor: 'pointer', transition: 'all 0.2s',
                border: '1px solid rgba(212,163,90,0.08)',
                background: saved === item.id ? 'rgba(74,222,128,0.06)' : 'rgba(212,163,90,0.04)',
                color: saved === item.id ? 'rgba(74,222,128,0.5)' : 'rgba(212,163,90,0.35)',
                opacity: saving === item.id ? 0.5 : 1,
              }}
              onMouseEnter={(e) => { if (!saving && saved !== item.id) { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,163,90,0.18)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,163,90,0.07)' } }}
              onMouseLeave={(e) => { if (!saving && saved !== item.id) { (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,163,90,0.08)'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(212,163,90,0.04)' } }}
            >
              <BookmarkPlus size={11} />
              {saved === item.id ? 'Saved' : 'Save'}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
