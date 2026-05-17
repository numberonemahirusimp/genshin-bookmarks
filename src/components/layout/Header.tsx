import { motion } from 'framer-motion'

interface HeaderProps {
  title: string
  subtitle?: string
  count: number
  onSearchOpen: () => void
  onThemeToggle: () => void
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="archive-topbar"
    >
      <div className="archive-brand">
        <div className="archive-emblem" aria-hidden="true" />
        <div className="min-w-0">
          <div className="archive-title-row">
            <h1 className="archive-title">{title}</h1>
          </div>
          <p className="archive-subtitle">{subtitle || 'Bookmark collection'}</p>
        </div>
      </div>
    </motion.header>
  )
}
