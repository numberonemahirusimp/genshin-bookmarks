import { GenshinStats } from '../../services/genshinApi'
import { FantasyPanel } from '../ui/FantasyPanel'
import { Trophy, BarChart3, Map } from '../ui/Icons'

interface StatsWidgetProps {
  stats: GenshinStats | null
  loading: boolean
}

const primaryStats = [
  { key: 'activeDays', label: 'Days Active' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'spiralAbyss', label: 'Abyss' },
  { key: 'anemoculi', label: 'Anemoculi' },
]

const chestTypes = [
  { key: 'commonChests', label: 'Common' },
  { key: 'exquisiteChests', label: 'Exquisite' },
  { key: 'preciousChests', label: 'Precious' },
  { key: 'luxuriousChests', label: 'Luxurious' },
]

export function StatsWidget({ stats, loading }: StatsWidgetProps) {
  return (
    <FantasyPanel className="p-6" withCorners={false}>
      <div className="flex items-center gap-2 mb-5">
        <Trophy size={14} className="text-[var(--color-gold)]/40" />
        <h3 className="font-display text-sm font-medium text-[var(--color-text)]/80 tracking-wide">Battle Stats</h3>
      </div>

      {loading ? (
        <div className="shimmer-loading h-32 rounded-xl" />
      ) : !stats ? (
        <div className="text-center py-8"><p className="text-xs font-light text-[var(--color-text-secondary)]/30">Connect Hoyolab to see stats</p></div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2">
            {primaryStats.map(s => {
              const val = (stats as any)[s.key]
              return (
                <div key={s.key} className="p-3 rounded-xl bg-black/15 border border-[var(--color-border)]">
                  <p className="text-[9px] font-light text-[var(--color-text-secondary)]/40 mb-0.5">{s.label}</p>
                  <p className="font-display text-sm font-light text-[var(--color-text)]/70">{val ?? '—'}</p>
                </div>
              )
            })}
          </div>

          <div className="genshin-divider my-4" />
          <div className="flex items-center gap-2 mb-3">
            <Map size={12} className="text-[var(--color-gold)]/40" />
            <span className="text-[9px] font-light text-[var(--color-text-secondary)]/40 uppercase tracking-wider">Chests</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {chestTypes.map(c => (
              <div key={c.key} className="px-2.5 py-1 rounded-lg bg-black/15 border border-[var(--color-border)] text-[10px] font-light text-[var(--color-text-secondary)]/50">
                {c.label}: {(stats as any)[c.key] ?? 0}
              </div>
            ))}
          </div>
        </>
      )}
    </FantasyPanel>
  )
}
