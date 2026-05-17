import { useEffect, useMemo, useRef, useState } from 'react'
import { Bookmark, ThemeId } from '../../types'
import { fetchResinData, GenshinAuth, ResinData } from '../../services/genshinApi'
import {
  Archive, BarChart3, BookOpen, Check, Clock, Compass, Gem, Heart,
  Plus, Star, Trophy, Video, X,
} from '../ui/Icons'
import { ThemeSwitcher } from '../themes/ThemeSwitcher'
import { buildYouTubeEmbedUrl, youtubeEmbedModes, YouTubeEmbedMode } from '../../utils/youtube'

type WidgetId = 'clock' | 'archivePulse' | 'resinPlan' | 'dailyBoard' | 'wishLedger' | 'routeNotes' | 'youtube'

interface HomePageProps {
  bookmarks: Bookmark[]
  favoriteBookmarks: Bookmark[]
  recentBookmarks: Bookmark[]
  totalVisits: number
  genshinAuth: GenshinAuth | null
  activeTheme: ThemeId
  isThemeOpen: boolean
  onThemeChange: (theme: ThemeId) => void
  onThemeToggle: () => void
  onOpenWidget: (widget: WidgetId) => void
}

interface WidgetPosition {
  x: number
  y: number
}

const widgetCatalog: { id: WidgetId; title: string; icon: typeof Clock; width: number; height: number }[] = [
  { id: 'clock', title: 'Moon Clock', icon: Clock, width: 260, height: 150 },
  { id: 'archivePulse', title: 'Archive Pulse', icon: BarChart3, width: 300, height: 170 },
  { id: 'resinPlan', title: 'Resin Plan', icon: Gem, width: 280, height: 190 },
  { id: 'dailyBoard', title: 'Daily Board', icon: Check, width: 290, height: 210 },
  { id: 'wishLedger', title: 'Wish Ledger', icon: Star, width: 270, height: 180 },
  { id: 'routeNotes', title: 'Route Notes', icon: Compass, width: 310, height: 190 },
  { id: 'youtube', title: 'YouTube', icon: Video, width: 520, height: 390 },
]

const defaultPositions: Record<WidgetId, WidgetPosition> = {
  clock: { x: 64, y: 92 },
  archivePulse: { x: 360, y: 92 },
  resinPlan: { x: 86, y: 286 },
  dailyBoard: { x: 408, y: 296 },
  wishLedger: { x: 742, y: 108 },
  routeNotes: { x: 742, y: 322 },
  youtube: { x: 336, y: 286 },
}

const defaultVisible: WidgetId[] = ['clock', 'archivePulse', 'resinPlan']

export function HomePage({
  bookmarks,
  favoriteBookmarks,
  recentBookmarks,
  totalVisits,
  genshinAuth,
  activeTheme,
  isThemeOpen,
  onThemeChange,
  onThemeToggle,
}: HomePageProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [now, setNow] = useState(new Date())
  const [visible, setVisible] = useState<WidgetId[]>(() => readStored('home-widgets-visible', defaultVisible))
  const [positions, setPositions] = useState<Record<WidgetId, WidgetPosition>>(() => readStored('home-widgets-positions', defaultPositions))
  const [activeWidget, setActiveWidget] = useState<WidgetId | null>(null)
  const [resinData, setResinData] = useState<ResinData | null>(null)

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    localStorage.setItem('home-widgets-visible', JSON.stringify(visible))
  }, [visible])

  useEffect(() => {
    localStorage.setItem('home-widgets-positions', JSON.stringify(positions))
  }, [positions])

  useEffect(() => {
    if (!genshinAuth) {
      setResinData(null)
      return
    }
    let cancelled = false
    fetchResinData(genshinAuth).then(data => {
      if (!cancelled) setResinData(data)
    })
    const timer = setInterval(() => {
      fetchResinData(genshinAuth).then(data => {
        if (!cancelled) setResinData(data)
      })
    }, 120000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [genshinAuth])

  const mostVisited = useMemo(
    () => [...bookmarks].sort((a, b) => b.visitCount - a.visitCount)[0],
    [bookmarks],
  )

  function toggleWidget(id: WidgetId) {
    setVisible(current => current.includes(id) ? current.filter(widget => widget !== id) : [...current, id])
  }

  function moveWidget(id: WidgetId, next: WidgetPosition) {
    setPositions(current => ({
      ...current,
      [id]: {
        x: Math.max(16, Math.min(next.x, window.innerWidth - 220)),
        y: Math.max(72, Math.min(next.y, window.innerHeight - 170)),
      },
    }))
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="fixed left-6 top-6 z-[80] flex items-center gap-3">
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="archive-pill ui-sans flex items-center gap-2 px-4 text-sm"
          type="button"
        >
          <Plus size={15} />
          Widgets
        </button>
      </div>

      <div className="fixed right-6 top-6 z-[80]">
        <ThemeSwitcher
          activeTheme={activeTheme}
          onSelect={onThemeChange}
          isOpen={isThemeOpen}
          onToggle={onThemeToggle}
        />
      </div>

      {drawerOpen && (
        <div className="archive-card fixed left-6 top-20 z-[80] w-72 p-3">
          <div className="px-3 pb-2 text-base uppercase" style={{ color: 'rgba(255,249,237,0.9)' }}>
            Home Widgets
          </div>
          <div className="space-y-1">
            {widgetCatalog.map(widget => {
              const active = visible.includes(widget.id)
              return (
                <button
                  key={widget.id}
                  onClick={() => toggleWidget(widget.id)}
                  className="ui-sans flex w-full items-center gap-3 rounded-md border px-3 py-3 text-left transition-colors"
                  style={{
                    borderColor: active ? 'rgba(229,194,137,0.34)' : 'transparent',
                    background: active ? 'rgba(229,194,137,0.09)' : 'transparent',
                    color: active ? 'rgba(255,249,237,0.9)' : 'rgba(216,200,175,0.65)',
                  }}
                  type="button"
                >
                  <widget.icon size={17} />
                  <span className="flex-1">{widget.title}</span>
                  {active && <Check size={14} />}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="home-widget-stage absolute inset-0">
        {widgetCatalog.filter(widget => visible.includes(widget.id)).map(widget => (
          <DraggableWidget
            key={widget.id}
            id={widget.id}
            title={widget.title}
            icon={widget.icon}
            width={widget.width}
            height={widget.height}
            position={positions[widget.id] || defaultPositions[widget.id]}
            isActive={activeWidget === widget.id}
            onMove={moveWidget}
            onFocus={() => setActiveWidget(widget.id)}
            onBlur={() => setActiveWidget(null)}
            onClose={() => toggleWidget(widget.id)}
          >
            {renderWidget(widget.id, { now, bookmarks, favoriteBookmarks, recentBookmarks, totalVisits, mostVisited, resinData, loggedIn: !!genshinAuth })}
          </DraggableWidget>
        ))}
      </div>
    </main>
  )
}

function DraggableWidget({
  id,
  title,
  icon: Icon,
  width,
  height,
  position,
  isActive,
  onMove,
  onFocus,
  onBlur,
  onClose,
  children,
}: {
  id: WidgetId
  title: string
  icon: typeof Clock
  width: number
  height: number
  position: WidgetPosition
  isActive: boolean
  onMove: (id: WidgetId, position: WidgetPosition) => void
  onFocus: () => void
  onBlur: () => void
  onClose: () => void
  children: React.ReactNode
}) {
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null)

  function startDrag(event: React.PointerEvent) {
    onFocus()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragRef.current = { sx: event.clientX, sy: event.clientY, ox: position.x, oy: position.y }
  }

  function drag(event: React.PointerEvent) {
    if (!dragRef.current) return
    onMove(id, {
      x: dragRef.current.ox + event.clientX - dragRef.current.sx,
      y: dragRef.current.oy + event.clientY - dragRef.current.sy,
    })
  }

  function endDrag() {
    dragRef.current = null
    onBlur()
  }

  return (
    <section
      className="home-widget archive-card absolute select-none"
      style={{
        left: position.x,
        top: position.y,
        width: `min(${width}px, calc(100vw - 28px))`,
        minHeight: height,
        zIndex: isActive ? 120 : 20,
        '--widget-width': `${width}px`,
      } as React.CSSProperties}
      onPointerDown={onFocus}
    >
      <div
        className="flex cursor-grab items-center justify-between px-4 py-3 active:cursor-grabbing"
        onPointerDown={startDrag}
        onPointerMove={drag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{ borderBottom: '1px solid rgba(229,194,137,0.12)' }}
      >
        <div className="flex items-center gap-2">
          <Icon size={16} style={{ color: 'rgba(229,194,137,0.9)' }} />
          <span className="ui-sans text-xs uppercase tracking-[0.08em]" style={{ color: 'rgba(255,249,237,0.82)' }}>{title}</span>
        </div>
        <button
          onPointerDown={event => event.stopPropagation()}
          onClick={event => { event.stopPropagation(); onClose() }}
          className="rounded-full p-1 hover:bg-white/5"
          type="button"
          aria-label="Remove widget"
        >
          <X size={13} />
        </button>
      </div>
      <div className="p-4">{children}</div>
    </section>
  )
}

function renderWidget(id: WidgetId, data: {
  now: Date
  bookmarks: Bookmark[]
  favoriteBookmarks: Bookmark[]
  recentBookmarks: Bookmark[]
  totalVisits: number
  mostVisited?: Bookmark
  resinData: ResinData | null
  loggedIn: boolean
}) {
  switch (id) {
    case 'clock':
      return <ClockWidget now={data.now} />
    case 'archivePulse':
      return <ArchivePulse {...data} />
    case 'resinPlan':
      return <ResinPlan resinData={data.resinData} loggedIn={data.loggedIn} />
    case 'dailyBoard':
      return <DailyBoard resinData={data.resinData} loggedIn={data.loggedIn} />
    case 'wishLedger':
      return <WishLedger />
    case 'routeNotes':
      return <RouteNotes />
    case 'youtube':
      return <YouTubeWidget />
  }
}

function ClockWidget({ now }: { now: Date }) {
  return (
    <div>
      <div className="text-5xl leading-none" style={{ color: 'rgba(255,249,237,0.95)' }}>
        {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="ui-sans mt-2 text-xs" style={{ color: 'rgba(216,200,175,0.6)' }}>
        {now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
    </div>
  )
}

function ArchivePulse({ bookmarks, favoriteBookmarks, totalVisits, mostVisited }: {
  bookmarks: Bookmark[]
  favoriteBookmarks: Bookmark[]
  totalVisits: number
  mostVisited?: Bookmark
}) {
  return (
    <div className="ui-sans space-y-3 text-sm" style={{ color: 'rgba(255,249,237,0.78)' }}>
      <div className="grid grid-cols-3 gap-2">
        <Metric icon={Archive} label="Saved" value={bookmarks.length} />
        <Metric icon={Heart} label="Loved" value={favoriteBookmarks.length} />
        <Metric icon={Trophy} label="Visits" value={totalVisits} />
      </div>
      <div className="rounded-md border p-3" style={{ borderColor: 'rgba(229,194,137,0.14)', background: 'rgba(0,0,0,0.12)' }}>
        <div className="text-[10px] uppercase tracking-[0.12em]" style={{ color: 'rgba(229,194,137,0.72)' }}>Current trail</div>
        <div className="mt-1 truncate">{mostVisited?.title || 'No route discovered yet'}</div>
      </div>
    </div>
  )
}

function Metric({ icon: Icon, label, value }: { icon: typeof Archive; label: string; value: number }) {
  return (
    <div className="rounded-md border p-2 text-center" style={{ borderColor: 'rgba(229,194,137,0.14)' }}>
      <Icon size={15} className="mx-auto mb-1" />
      <div>{value}</div>
      <div className="text-[10px]" style={{ color: 'rgba(216,200,175,0.48)' }}>{label}</div>
    </div>
  )
}

function ResinPlan({ resinData, loggedIn }: { resinData: ResinData | null; loggedIn: boolean }) {
  const [resin, setResin] = useLocalState('home-resin-widget', 80)
  const currentResin = resinData?.currentResin ?? resin
  const maxResin = resinData?.maxResin ?? 200
  const percent = Math.min(100, Math.round((currentResin / maxResin) * 100))
  return (
    <div className="ui-sans">
      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl" style={{ color: 'rgba(255,249,237,0.94)' }}>{currentResin}/{maxResin}</div>
          <div className="text-xs" style={{ color: 'rgba(216,200,175,0.55)' }}>
            {resinData ? 'Synced from Hoyolab' : loggedIn ? 'Waiting for Hoyolab' : 'Manual resin'}
          </div>
        </div>
        <Gem size={34} style={{ color: 'rgba(229,194,137,0.75)' }} />
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/25">
        <div className="h-full rounded-full" style={{ width: `${percent}%`, background: 'linear-gradient(90deg, #8dbbcb, #e5c289)' }} />
      </div>
      {!resinData && <input className="mt-4 w-full" type="range" min="0" max="200" value={resin} onChange={event => setResin(Number(event.target.value))} />}
      {resinData?.resinRecoveryTime && (
        <div className="mt-3 text-xs" style={{ color: 'rgba(216,200,175,0.55)' }}>Full in {resinData.resinRecoveryTime}</div>
      )}
    </div>
  )
}

function DailyBoard({ resinData, loggedIn }: { resinData: ResinData | null; loggedIn: boolean }) {
  const [done, setDone] = useLocalState<Record<string, boolean>>('home-daily-board', {})
  const tasks = [
    { label: 'Commissions', auto: resinData ? resinData.finishedTaskNum >= resinData.totalTaskNum && resinData.totalTaskNum > 0 : false },
    { label: 'Resin spend', auto: resinData ? resinData.currentResin < 40 : false },
    { label: 'Expeditions', auto: resinData ? resinData.currentExpeditionNum >= resinData.maxExpeditionNum : false },
    { label: 'Realm currency', auto: resinData ? resinData.currentRealmCurrency >= resinData.maxRealmCurrency : false },
  ]
  return (
    <div className="ui-sans space-y-2">
      {tasks.map(task => (
        <button
          key={task.label}
          onClick={() => setDone({ ...done, [task.label]: !done[task.label] })}
          className="flex w-full items-center gap-3 rounded-md border px-3 py-2 text-left text-sm"
          style={{
            borderColor: task.auto || done[task.label] ? 'rgba(139, 211, 159, 0.34)' : 'rgba(229,194,137,0.14)',
            color: task.auto || done[task.label] ? 'rgba(185, 235, 198, 0.9)' : 'rgba(255,249,237,0.78)',
          }}
          type="button"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full border" style={{ borderColor: 'currentColor' }}>
            {(task.auto || done[task.label]) && <Check size={12} />}
          </span>
          <span className="flex-1">{task.label}</span>
          {task.auto && <span className="text-[10px] uppercase">auto</span>}
        </button>
      ))}
      {!resinData && loggedIn && <div className="text-[11px]" style={{ color: 'rgba(216,200,175,0.5)' }}>Waiting for daily note data.</div>}
    </div>
  )
}

function WishLedger() {
  const [pity, setPity] = useLocalState('home-pity', 23)
  const [guaranteed, setGuaranteed] = useLocalState('home-guaranteed', false)
  const [historyText, setHistoryText] = useState('')
  const [historySummary, setHistorySummary] = useLocalState<{ pity: number; guaranteed: boolean } | null>('home-wish-history-summary', null)
  const displayPity = historySummary?.pity ?? pity
  const displayGuaranteed = historySummary?.guaranteed ?? guaranteed

  function importHistory() {
    const summary = summarizeWishHistory(historyText)
    if (!summary) return
    setHistorySummary(summary)
    setPity(summary.pity)
    setGuaranteed(summary.guaranteed)
    setHistoryText('')
  }

  return (
    <div className="ui-sans">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl" style={{ color: 'rgba(255,249,237,0.92)' }}>{displayPity}</div>
          <div className="text-xs" style={{ color: 'rgba(216,200,175,0.55)' }}>{historySummary ? 'calculated pity' : 'manual pity'}</div>
        </div>
        <Star size={34} style={{ color: displayGuaranteed ? '#e5c289' : 'rgba(216,200,175,0.5)' }} />
      </div>
      {!historySummary && <input className="mt-4 w-full" type="range" min="0" max="90" value={pity} onChange={event => setPity(Number(event.target.value))} />}
      <button onClick={() => historySummary ? setHistorySummary(null) : setGuaranteed(!guaranteed)} className="mt-3 rounded-md border px-3 py-2 text-xs" style={{ borderColor: 'rgba(229,194,137,0.2)' }} type="button">
        {historySummary ? 'Clear import' : displayGuaranteed ? 'Guaranteed active' : '50/50 pending'}
      </button>
      <textarea
        value={historyText}
        onChange={event => setHistoryText(event.target.value)}
        className="mt-3 h-14 w-full resize-none rounded-md border bg-black/20 p-2 text-[11px] outline-none"
        style={{ borderColor: 'rgba(229,194,137,0.16)', color: 'rgba(255,249,237,0.72)' }}
        placeholder="Paste wish history JSON to auto-calc"
      />
      <button onClick={importHistory} className="mt-2 rounded-md border px-3 py-1.5 text-[11px]" style={{ borderColor: 'rgba(229,194,137,0.2)' }} type="button">
        Calculate from history
      </button>
    </div>
  )
}

const standardFiveStars = new Set(['Jean', 'Diluc', 'Mona', 'Qiqi', 'Keqing', 'Tighnari', 'Dehya'])

function summarizeWishHistory(raw: string): { pity: number; guaranteed: boolean } | null {
  try {
    const parsed = JSON.parse(raw)
    const list: any[] = Array.isArray(parsed) ? parsed : Array.isArray(parsed.list) ? parsed.list : Array.isArray(parsed.data?.list) ? parsed.data.list : []
    if (!list.length) return null
    const newestFirst = [...list].sort((a, b) => String(b.time || '').localeCompare(String(a.time || '')))
    const lastFiveIndex = newestFirst.findIndex(item => String(item.rank_type) === '5')
    const pity = lastFiveIndex === -1 ? newestFirst.length : lastFiveIndex
    const lastFive = lastFiveIndex >= 0 ? newestFirst[lastFiveIndex] : null
    return {
      pity: Math.min(90, pity),
      guaranteed: !!lastFive && standardFiveStars.has(String(lastFive.name || '')),
    }
  } catch {
    return null
  }
}

function RouteNotes() {
  const [note, setNote] = useLocalState('home-route-note', 'Crystalflies near Dawn Winery')
  return (
    <div>
      <div className="mb-3 flex items-center gap-2" style={{ color: 'rgba(229,194,137,0.8)' }}>
        <BookOpen size={18} />
        <span className="ui-sans text-xs uppercase tracking-[0.1em]">Next route</span>
      </div>
      <textarea
        value={note}
        onChange={event => setNote(event.target.value)}
        className="ui-sans min-h-[88px] w-full resize-none rounded-md border bg-black/20 p-3 text-sm outline-none"
        style={{ borderColor: 'rgba(229,194,137,0.16)', color: 'rgba(255,249,237,0.82)' }}
      />
    </div>
  )
}

function YouTubeWidget() {
  const [rawUrl, setRawUrl] = useLocalState('home-youtube-url', '')
  const [embedMode, setEmbedMode] = useLocalState<YouTubeEmbedMode>('home-youtube-embed-mode', 'privacy')
  const [draftUrl, setDraftUrl] = useState(rawUrl)
  const embed = buildYouTubeEmbedUrl(rawUrl, '', embedMode)

  function loadVideo() {
    setRawUrl(draftUrl.trim())
  }

  function clearVideo() {
    setDraftUrl('')
    setRawUrl('')
  }

  return (
    <div className="ui-sans space-y-3">
      {embed ? (
        <div className="youtube-card">
          <iframe
            key={embed}
            src={embed}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>
      ) : rawUrl ? (
        <div className="youtube-error">Paste a valid YouTube video link.</div>
      ) : (
        <div className="youtube-card">
          <div className="flex h-full min-h-[210px] items-center justify-center px-6 text-center text-sm" style={{ color: 'rgba(216,200,175,0.58)' }}>
            Paste a YouTube link below.
          </div>
        </div>
      )}
      {embed && (
        <div className="youtube-mode-row">
          {youtubeEmbedModes.map(mode => (
            <button
              key={mode.id}
              className={embedMode === mode.id ? 'active' : ''}
              onClick={() => setEmbedMode(mode.id)}
              type="button"
            >
              {mode.label}
            </button>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <input
          value={draftUrl}
          onChange={event => setDraftUrl(event.target.value)}
          onKeyDown={event => { if (event.key === 'Enter') loadVideo() }}
          className="min-w-0 flex-1 rounded-md border bg-black/20 px-3 py-2 text-xs outline-none"
          style={{ borderColor: 'rgba(229,194,137,0.16)', color: 'rgba(255,249,237,0.86)' }}
          placeholder="Paste YouTube URL or video ID"
        />
        <button
          onClick={loadVideo}
          className="rounded-md border px-3 py-2 text-xs"
          style={{ borderColor: 'rgba(229,194,137,0.26)', color: 'rgba(255,249,237,0.86)', background: 'rgba(229,194,137,0.08)' }}
          type="button"
        >
          Load
        </button>
        {rawUrl && (
          <button
            onClick={clearVideo}
            className="rounded-md border px-3 py-2 text-xs"
            style={{ borderColor: 'rgba(229,194,137,0.16)', color: 'rgba(216,200,175,0.72)' }}
            type="button"
          >
            Clear
          </button>
        )}
      </div>
    </div>
  )
}

function useLocalState<T>(key: string, fallback: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => readStored(key, fallback))
  return [value, (next: T) => {
    setValue(next)
    localStorage.setItem(key, JSON.stringify(next))
  }]
}

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
