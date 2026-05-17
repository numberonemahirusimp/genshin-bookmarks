import { ResinData } from '../../services/genshinApi'
import { FantasyPanel } from '../ui/FantasyPanel'
import { Badge } from '../ui/Badge'
import { Clock, Sparkles } from '../ui/Icons'

interface ResinWidgetProps {
  data: ResinData | null
  loading: boolean
}

function formatTime(seconds: string): string {
  const total = parseInt(seconds)
  if (isNaN(total) || total <= 0) return 'Ready'
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  return `${h}h ${m}m`
}

export function ResinWidget({ data, loading }: ResinWidgetProps) {
  const percent = data ? (data.currentResin / data.maxResin) * 100 : 0

  return (
    <FantasyPanel className="p-6" withCorners={false}>
      <div className="flex items-center gap-2 mb-5">
        <Sparkles size={14} className="text-amber-400/50" />
        <h3 className="font-display text-sm font-medium text-[var(--color-text)]/80 tracking-wide">Original Resin</h3>
      </div>

      {loading ? (
        <div className="shimmer-loading h-24 rounded-xl" />
      ) : !data ? (
        <div className="text-center py-8"><p className="text-xs font-light text-[var(--color-text-secondary)]/30">Connect Hoyolab to see resin data</p></div>
      ) : (
        <div className="flex items-center gap-6">
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="#d4a35a" strokeWidth="4" opacity="0.3"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - percent / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="font-display text-lg font-light text-[var(--color-text)]/80">{data.currentResin}</span>
              <span className="text-[9px] font-light text-[var(--color-text-secondary)]/30 mt-1.5">/{data.maxResin}</span>
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-light text-[var(--color-text-secondary)]/40">Recovery</span>
              <span className="text-xs font-light text-[var(--color-text)]/60 flex items-center gap-1">
                <Clock size={10} className="text-[var(--color-gold)]/40" />
                {formatTime(data.resinRecoveryTime)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-light text-[var(--color-text-secondary)]/40">Expeditions</span>
              <span className="text-xs font-light text-[var(--color-text)]/60">{data.currentExpeditionNum}/{data.maxExpeditionNum}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-light text-[var(--color-text-secondary)]/40">Realm Currency</span>
              <span className="text-xs font-light text-[var(--color-text)]/60">{data.currentRealmCurrency.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {data && (
        <div className="mt-4 flex gap-2">
          <Badge variant="muted" size="sm">Daily: {data.finishedTaskNum}/{data.totalTaskNum}</Badge>
          <Badge variant="muted" size="sm">Bosses: {data.weekBossResinDiscount}/3</Badge>
        </div>
      )}
    </FantasyPanel>
  )
}
