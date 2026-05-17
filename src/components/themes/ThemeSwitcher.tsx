import { motion, AnimatePresence } from 'framer-motion'
import { ThemeId } from '../../types'
import { themes } from '../../themes'

interface ThemeSwitcherProps {
  activeTheme: ThemeId
  onSelect: (theme: ThemeId) => void
  isOpen: boolean
  onToggle: () => void
}

function RegionMark({ id, color }: { id: ThemeId; color: string }) {
  const common = { fill: 'none', stroke: color, strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  if (id === 'mondstadt') return <svg width="22" height="22" viewBox="0 0 24 24"><path {...common} d="M12 3v18M3 12h18M6.5 6.5l11 11M17.5 6.5l-11 11" /><circle cx="12" cy="12" r="3" fill={color} opacity="0.45" /></svg>
  if (id === 'liyue') return <svg width="22" height="22" viewBox="0 0 24 24"><path {...common} d="M12 3l7 7-7 11-7-11 7-7zM5 10h14M9 10l3 11 3-11" /></svg>
  if (id === 'inazuma') return <svg width="22" height="22" viewBox="0 0 24 24"><path {...common} d="M13 2L5 13h6l-1 9 9-13h-6l0-7z" /></svg>
  if (id === 'sumeru') return <svg width="22" height="22" viewBox="0 0 24 24"><path {...common} d="M12 21c5-4 7-8 7-12a7 7 0 0 0-14 0c0 4 2 8 7 12zM12 21V9M8 12l4-3 4 3" /></svg>
  if (id === 'fontaine') return <svg width="22" height="22" viewBox="0 0 24 24"><path {...common} d="M12 3c4 5 7 8 7 12a7 7 0 0 1-14 0c0-4 3-7 7-12zM8 15c2 2 6 2 8 0" /></svg>
  return <svg width="22" height="22" viewBox="0 0 24 24"><path {...common} d="M12 3v18M5 7l14 10M19 7L5 17M7 5l10 14M17 5L7 19" /><circle cx="12" cy="12" r="2.5" fill={color} opacity="0.35" /></svg>
}

export function ThemeSwitcher({ activeTheme, onSelect, isOpen, onToggle }: ThemeSwitcherProps) {
  const themeList = Object.values(themes)

  return (
    <div className="relative z-[90]" onClick={event => event.stopPropagation()}>
      <motion.button
        onClick={event => { event.stopPropagation(); onToggle() }}
        whileTap={{ scale: 0.97 }}
        className="archive-pill flex items-center gap-2 px-4 text-lg transition-all duration-300"
      >
        <RegionMark id={activeTheme} color="rgba(229, 194, 137, 0.95)" />
        <span className="hidden sm:inline">{themes[activeTheme].name}</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="archive-card absolute right-0 top-full z-[90] mt-3 w-72 p-0"
            onClick={(event: React.MouseEvent) => event.stopPropagation()}
          >
            <div className="corner-ornament corner-ornament-tl" />
            <div className="corner-ornament corner-ornament-tr" />
            <div className="corner-ornament corner-ornament-bl" />
            <div className="corner-ornament corner-ornament-br" />

            <div className="max-h-[72vh] overflow-y-auto p-3">
            <div className="px-3 pb-3 pt-2">
              <p className="text-base uppercase" style={{ color: 'rgba(255, 249, 237, 0.9)' }}>Regional Themes</p>
              <p className="ui-sans mt-1 text-xs" style={{ color: 'rgba(216, 200, 175, 0.52)' }}>Change the atmosphere</p>
            </div>

            <div className="space-y-1">
              {themeList.map(theme => {
                const active = activeTheme === theme.id
                return (
                  <button
                    key={theme.id}
                    onClick={() => { onSelect(theme.id); onToggle() }}
                    className="ui-sans flex w-full items-center gap-3 rounded-md border px-3 py-3 text-left transition-all duration-200"
                    style={{
                      borderColor: active ? 'rgba(229, 194, 137, 0.36)' : 'transparent',
                      background: active ? 'rgba(229, 194, 137, 0.1)' : 'transparent',
                      color: active ? 'rgba(255, 249, 237, 0.9)' : 'rgba(216, 200, 175, 0.68)',
                    }}
                    type="button"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border text-base" style={{ borderColor: 'rgba(229, 194, 137, 0.24)' }}>
                      <RegionMark id={theme.id} color={theme.colors.accent} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm">{theme.name}</span>
                      <span className="block truncate text-[11px]" style={{ color: 'rgba(216, 200, 175, 0.42)' }}>{theme.region}</span>
                    </span>
                    {active && <span className="h-2 w-2 rounded-full" style={{ background: 'rgba(229, 194, 137, 0.75)' }} />}
                  </button>
                )
              })}
            </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
