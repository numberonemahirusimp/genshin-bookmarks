import { useEffect, useMemo, useState } from 'react'
import {
  CharacterData, fetchCharacters, fetchResinData, fetchStats,
  getAuthFromCookies,
  GenshinAuth, GenshinStats, ResinData,
} from '../../services/genshinApi'
import { db } from '../../store'
import { Archive, BarChart3, Check, Clock, Gem, RefreshCw, Star, Trophy, User } from '../ui/Icons'

interface GenshinDashboardProps {
  auth: GenshinAuth | null
  onAuthChange: (auth: GenshinAuth | null) => void
}

type TabId = 'overview' | 'resin' | 'roster'

export function GenshinDashboard({ auth, onAuthChange }: GenshinDashboardProps) {
  const [ltuid, setLtuid] = useState(auth?.ltuid || '')
  const [ltoken, setLtoken] = useState(auth?.ltoken || '')
  const [uid, setUid] = useState(auth?.uid || '')
  const [tab, setTab] = useState<TabId>('overview')
  const [loading, setLoading] = useState(false)
  const [resin, setResin] = useState<ResinData | null>(null)
  const [stats, setStats] = useState<GenshinStats | null>(null)
  const [characters, setCharacters] = useState<CharacterData[]>([])
  const [manualResin, setManualResin] = useLocalState('genshin-manual-resin', 120)
  const [tasks, setTasks] = useLocalState<Record<string, boolean>>('genshin-task-board', {})

  useEffect(() => {
    if (!auth) return
    let cancelled = false
    setLoading(true)
    Promise.all([
      fetchResinData(auth),
      fetchStats(auth),
      fetchCharacters(auth),
    ]).then(([resinData, statsData, characterData]) => {
      if (cancelled) return
      setResin(resinData)
      setStats(statsData)
      setCharacters(characterData || [])
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [auth])

  const displayedResin = resin?.currentResin ?? manualResin
  const maxResin = resin?.maxResin ?? 200
  const resinPercent = Math.round((displayedResin / maxResin) * 100)
  const topCharacters = useMemo(() => characters.slice(0, 8), [characters])

  if (!auth) {
    return (
      <div className="archive-page">
        <div className="archive-card mx-auto max-w-xl p-7">
          <div className="mb-7">
            <h1 className="archive-title">Connect Hoyolab</h1>
            <p className="archive-subtitle">Save your credentials locally to unlock the interactive Genshin screen.</p>
          </div>

          <div className="space-y-4">
            {(['uid', 'ltuid', 'ltoken'] as const).map((field) => (
              <label key={field} className="ui-sans block text-xs uppercase tracking-[0.12em]" style={{ color: 'rgba(216,200,175,0.62)' }}>
                {field}
                <input
                  value={field === 'uid' ? uid : field === 'ltuid' ? ltuid : ltoken}
                  onChange={(event) => {
                    const value = event.target.value
                    if (field === 'uid') setUid(value)
                    else if (field === 'ltuid') setLtuid(value)
                    else setLtoken(value)
                  }}
                  placeholder={field === 'uid' ? 'e.g. 812345678' : 'From cookies'}
                  className="mt-2 w-full rounded-lg border bg-black/20 px-4 py-3 text-sm normal-case tracking-normal outline-none"
                  style={{ borderColor: 'rgba(229,194,137,0.18)', color: 'rgba(255,249,237,0.86)' }}
                />
              </label>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={async () => {
                const cookies = await getAuthFromCookies()
                if (cookies) { setLtuid(cookies.ltuid); setLtoken(cookies.ltoken); setUid(cookies.uid) }
              }}
              className="archive-pill ui-sans flex items-center gap-2 px-4 py-2 text-xs"
              type="button"
            >
              <RefreshCw size={12} /> Detect from Browser
            </button>
            <button
              onClick={async () => {
                const cookies = await getAuthFromCookies()
                const nextAuth: GenshinAuth = {
                  ltuid, ltoken, uid,
                  ltoken_v2: cookies?.ltoken_v2 || undefined,
                  ltuid_v2: cookies?.ltuid_v2 || undefined,
                }
                await db.setSetting('genshinAuth', nextAuth)
                onAuthChange(nextAuth)
              }}
              disabled={!ltuid || !ltoken}
              className="archive-pill ui-sans px-5 text-sm"
              style={{ opacity: !ltuid || !ltoken ? 0.45 : 1 }}
              type="button"
            >
              Save & Connect
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="archive-page">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="archive-title">Traveler Console</h1>
          <p className="archive-subtitle">UID {auth.uid || 'Unknown'} {loading ? '- syncing' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {(['overview', 'resin', 'roster'] as TabId[]).map(item => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className="archive-pill ui-sans px-4 text-sm capitalize"
              style={{ borderColor: tab === item ? 'rgba(229,194,137,0.5)' : 'rgba(229,194,137,0.2)' }}
              type="button"
            >
              {item}
            </button>
          ))}
          <button
            onClick={async () => {
              await db.setSetting('genshinAuth', null)
              onAuthChange(null)
            }}
            className="archive-pill ui-sans px-4 text-sm"
            style={{ color: 'rgba(255,184,184,0.82)' }}
            type="button"
          >
            Disconnect
          </button>
        </div>
      </div>

      {tab === 'overview' && (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Panel title="Daily Readiness" icon={Check}>
            <TaskBoard tasks={tasks} setTasks={setTasks} />
          </Panel>
          <Panel title="Account Snapshot" icon={Trophy}>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Achievements" value={stats?.achievements ?? 0} />
              <Stat label="Active days" value={stats?.activeDays ?? 0} />
              <Stat label="Waypoints" value={stats?.unlockedWaypoints ?? 0} />
              <Stat label="Abyss" value={stats?.spiralAbyss || '--'} />
            </div>
          </Panel>
          <Panel title="Resin Flow" icon={Gem}>
            <ResinControl value={displayedResin} max={maxResin} percent={resinPercent} onManualChange={setManualResin} live={!!resin} />
          </Panel>
          <Panel title="Expeditions" icon={Clock}>
            <ExpeditionPanel resin={resin} />
          </Panel>
        </div>
      )}

      {tab === 'resin' && (
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <Panel title="Resin Planner" icon={Gem}>
            <ResinControl value={displayedResin} max={maxResin} percent={resinPercent} onManualChange={setManualResin} live={!!resin} large />
          </Panel>
          <Panel title="Spend Ideas" icon={Archive}>
            <SpendIdeas resin={displayedResin} />
          </Panel>
        </div>
      )}

      {tab === 'roster' && (
        <Panel title="Character Board" icon={User}>
          {topCharacters.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {topCharacters.map(character => (
                <div key={character.id} className="rounded-lg border p-3" style={{ borderColor: 'rgba(229,194,137,0.16)', background: 'rgba(0,0,0,0.14)' }}>
                  <div className="flex items-center gap-3">
                    {character.icon && <img src={character.icon} alt="" className="h-12 w-12 rounded-full object-cover" />}
                    <div className="min-w-0">
                      <div className="truncate text-lg">{character.name}</div>
                      <div className="ui-sans text-xs" style={{ color: 'rgba(216,200,175,0.55)' }}>Lv. {character.level} C{character.constellation}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <FallbackRoster />
          )}
        </Panel>
      )}
    </div>
  )
}

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof Archive; children: React.ReactNode }) {
  return (
    <section className="archive-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon size={18} style={{ color: 'rgba(229,194,137,0.9)' }} />
        <h2 className="ui-sans text-sm uppercase tracking-[0.12em]" style={{ color: 'rgba(255,249,237,0.84)' }}>{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border p-4" style={{ borderColor: 'rgba(229,194,137,0.15)' }}>
      <div className="text-2xl" style={{ color: 'rgba(255,249,237,0.92)' }}>{value}</div>
      <div className="ui-sans text-xs" style={{ color: 'rgba(216,200,175,0.52)' }}>{label}</div>
    </div>
  )
}

function TaskBoard({ tasks, setTasks }: { tasks: Record<string, boolean>; setTasks: (tasks: Record<string, boolean>) => void }) {
  const list = ['Commissions', 'Resin', 'Parametric Transformer', 'Realm Currency', 'Expeditions']
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {list.map(task => (
        <button
          key={task}
          onClick={() => setTasks({ ...tasks, [task]: !tasks[task] })}
          className="ui-sans flex items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm"
          style={{
            borderColor: tasks[task] ? 'rgba(139,211,159,0.35)' : 'rgba(229,194,137,0.15)',
            color: tasks[task] ? 'rgba(185,235,198,0.9)' : 'rgba(255,249,237,0.78)',
          }}
          type="button"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full border" style={{ borderColor: 'currentColor' }}>
            {tasks[task] && <Check size={12} />}
          </span>
          {task}
        </button>
      ))}
    </div>
  )
}

function ResinControl({ value, max, percent, onManualChange, live, large = false }: {
  value: number
  max: number
  percent: number
  onManualChange: (value: number) => void
  live: boolean
  large?: boolean
}) {
  return (
    <div className="ui-sans">
      <div className="flex items-end justify-between">
        <div>
          <div className={large ? 'text-6xl' : 'text-4xl'} style={{ color: 'rgba(255,249,237,0.94)' }}>{value}/{max}</div>
          <div className="mt-1 text-xs" style={{ color: 'rgba(216,200,175,0.55)' }}>{live ? 'Synced from Hoyolab' : 'Manual fallback mode'}</div>
        </div>
        <RefreshCw size={large ? 40 : 28} style={{ color: 'rgba(229,194,137,0.68)' }} />
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-black/25">
        <div className="h-full rounded-full" style={{ width: `${percent}%`, background: 'linear-gradient(90deg, #8dbbcb, #e5c289)' }} />
      </div>
      {!live && <input className="mt-5 w-full" type="range" min="0" max={max} value={value} onChange={event => onManualChange(Number(event.target.value))} />}
    </div>
  )
}

function ExpeditionPanel({ resin }: { resin: ResinData | null }) {
  const current = resin?.currentExpeditionNum ?? 0
  const max = resin?.maxExpeditionNum ?? 5
  return (
    <div className="ui-sans">
      <div className="text-4xl" style={{ color: 'rgba(255,249,237,0.92)' }}>{current}/{max}</div>
      <div className="mt-1 text-xs" style={{ color: 'rgba(216,200,175,0.55)' }}>expeditions active</div>
      <div className="mt-5 grid grid-cols-5 gap-2">
        {Array.from({ length: max }).map((_, index) => (
          <div key={index} className="h-12 rounded-lg border" style={{ borderColor: index < current ? 'rgba(229,194,137,0.45)' : 'rgba(229,194,137,0.12)', background: index < current ? 'rgba(229,194,137,0.1)' : 'rgba(0,0,0,0.12)' }} />
        ))}
      </div>
    </div>
  )
}

function SpendIdeas({ resin }: { resin: number }) {
  const ideas = resin >= 120 ? ['Weekly bosses', 'Artifact domains', 'Talent books'] : resin >= 40 ? ['Condensed resin', 'Boss material', 'Ley line'] : ['Save for later', 'Do commissions', 'Explore route']
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {ideas.map((idea, index) => (
        <div key={idea} className="rounded-lg border p-4" style={{ borderColor: 'rgba(229,194,137,0.15)', background: index === 0 ? 'rgba(229,194,137,0.08)' : 'rgba(0,0,0,0.12)' }}>
          <Star size={20} style={{ color: 'rgba(229,194,137,0.82)' }} />
          <div className="mt-3 text-lg">{idea}</div>
          <div className="ui-sans mt-1 text-xs" style={{ color: 'rgba(216,200,175,0.52)' }}>suggested action</div>
        </div>
      ))}
    </div>
  )
}

function FallbackRoster() {
  return (
    <div className="ui-sans rounded-lg border p-6 text-sm" style={{ borderColor: 'rgba(229,194,137,0.15)', color: 'rgba(216,200,175,0.68)' }}>
      Character data could not be loaded yet. The board will populate automatically when Hoyolab allows the request.
    </div>
  )
}

function useLocalState<T>(key: string, fallback: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : fallback
    } catch {
      return fallback
    }
  })
  return [value, (next: T) => {
    setValue(next)
    localStorage.setItem(key, JSON.stringify(next))
  }]
}
