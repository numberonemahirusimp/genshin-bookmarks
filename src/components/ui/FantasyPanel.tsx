import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface FantasyPanelProps {
  children: ReactNode
  className?: string
  withCorners?: boolean
  hover?: boolean
  onClick?: () => void
  delay?: number
}

export function FantasyPanel({
  children,
  className = '',
  withCorners = true,
  hover = false,
  onClick,
  delay = 0,
}: FantasyPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`
        relative rounded-2xl
        glass-card
        ${hover ? 'cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {withCorners && (
        <>
          <div className="corner-ornament corner-ornament-tl" />
          <div className="corner-ornament corner-ornament-tr" />
          <div className="corner-ornament corner-ornament-bl" />
          <div className="corner-ornament corner-ornament-br" />
        </>
      )}
      {children}
    </motion.div>
  )
}
