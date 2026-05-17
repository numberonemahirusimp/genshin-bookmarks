import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'gold' | 'primary' | 'accent' | 'muted'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'gold', size = 'sm', className = '' }: BadgeProps) {
  const variants = {
    gold: 'bg-[var(--color-gold)]/8 text-[var(--color-gold-light)]/70 border border-[var(--color-gold)]/12',
    primary: 'bg-[var(--color-primary)]/8 text-[var(--color-accent)]/70 border border-[var(--color-primary)]/12',
    accent: 'bg-[var(--color-accent)]/6 text-[var(--color-text-secondary)]/60 border border-[var(--color-accent)]/10',
    muted: 'bg-white/[0.03] text-[var(--color-text-secondary)]/40 border border-[var(--color-border)]',
  }

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-0.5 text-[11px]',
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-lg font-body font-normal tracking-wide ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  )
}
