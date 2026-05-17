import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GoldButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
  className?: string
  disabled?: boolean
}

export function GoldButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled = false,
}: GoldButtonProps) {
  const base = 'relative inline-flex items-center justify-center gap-2 font-body font-medium tracking-wide transition-all duration-300'

  const variants = {
    primary: `
      bg-gradient-to-r from-[var(--color-gold-dark)]/80 via-[var(--color-gold)]/90 to-[var(--color-gold-dark)]/80
      text-[#141825] border border-[var(--color-gold-light)]/20
      shadow-[0_0_20px_var(--color-glow),inset_0_1px_0_rgba(255,255,255,0.1)]
      hover:shadow-[0_0_30px_var(--color-glow),inset_0_1px_0_rgba(255,255,255,0.15)]
      hover:brightness-110 active:brightness-90
      disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:brightness-100
    `,
    secondary: `
      bg-transparent border border-[var(--color-border)] text-[var(--color-text-secondary)]
      hover:border-[var(--color-gold)]/30 hover:text-[var(--color-gold-light)]
      disabled:opacity-30 disabled:cursor-not-allowed
    `,
    ghost: `
      bg-transparent border border-transparent text-[var(--color-text-secondary)]/50
      hover:text-[var(--color-gold-light)]/70
      disabled:opacity-30 disabled:cursor-not-allowed
    `,
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-[11px] rounded-xl',
    md: 'px-5 py-2 text-sm rounded-xl',
    lg: 'px-7 py-3 text-sm rounded-xl',
  }

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon && <span className="w-3.5 h-3.5">{icon}</span>}
      {children}
    </motion.button>
  )
}
