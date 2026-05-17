interface GoldDividerProps {
  className?: string
  label?: string
}

export function GoldDivider({ className = '', label }: GoldDividerProps) {
  if (label) {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <div className="flex-1 genshin-divider" />
        <span className="text-[10px] font-body font-light tracking-[0.15em] text-[var(--color-gold)]/30 uppercase whitespace-nowrap">
          {label}
        </span>
        <div className="flex-1 genshin-divider" />
      </div>
    )
  }
  return <div className={`genshin-divider ${className}`} />
}
