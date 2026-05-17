import { motion } from 'framer-motion'

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center" style={{ background: '#0c0f18' }}>
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
      >
        <div className="w-16 h-16 rounded-full border border-[var(--color-gold)]/10"
          style={{ boxShadow: 'inset 0 0 30px rgba(212,163,90,0.03)' }}
        />
        <div className="absolute inset-1 rounded-full border-t border-[var(--color-gold)]/30"
          style={{ boxShadow: '0 0 20px rgba(212,163,90,0.05)' }}
        />
      </motion.div>

      <motion.div
        className="mt-6 text-center"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
      >
        <h2 className="font-display text-lg font-light tracking-[0.15em]" style={{ color: 'transparent' }}>
          .
        </h2>
        <p className="mt-2 text-[10px] font-light text-[var(--color-text-secondary)]/20 tracking-[0.2em] uppercase">
          Loading
        </p>
      </motion.div>

      <motion.div
        className="mt-6 flex gap-1.5"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
      >
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: 'var(--color-gold)' }}
            animate={{ opacity: [0.2, 0.6, 0.2], y: [0, -4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2, ease: 'easeInOut' }}
          />
        ))}
      </motion.div>

      <p className="absolute bottom-10 text-[9px] font-light text-[var(--color-text-secondary)]/10 tracking-[0.3em] uppercase">
        The archive awakens...
      </p>
    </div>
  )
}
