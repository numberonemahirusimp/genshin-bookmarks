import { motion } from 'framer-motion'
import { CharacterData, elementColors } from '../../services/genshinApi'
import { FantasyPanel } from '../ui/FantasyPanel'
import { User } from '../ui/Icons'

interface CharactersWidgetProps {
  characters: CharacterData[] | null
  loading: boolean
}

const elementEmojis: Record<string, string> = {
  Anemo: '🍃', Geo: '🪨', Electro: '⚡', Dendro: '🌿', Hydro: '💧', Pyro: '🔥', Cryo: '❄️',
}

export function CharactersWidget({ characters, loading }: CharactersWidgetProps) {
  return (
    <FantasyPanel className="p-6" withCorners>
      <div className="flex items-center gap-2 mb-5">
        <User size={14} className="text-[var(--color-gold)]/40" />
        <h3 className="font-display text-sm font-medium text-[var(--color-text)]/80 tracking-wide">Characters</h3>
        {characters && <span className="text-[10px] font-light text-[var(--color-text-secondary)]/30 ml-auto">{characters.length} owned</span>}
      </div>

      {loading ? (
        <div className="shimmer-loading h-32 rounded-xl" />
      ) : !characters ? (
        <div className="text-center py-8"><p className="text-xs font-light text-[var(--color-text-secondary)]/30">Connect Hoyolab to see characters</p></div>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {characters.slice(0, 12).map((char, i) => (
            <motion.div
              key={char.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.025 }}
              className="p-3 rounded-xl text-center bg-black/15 border border-[var(--color-border)] hover:border-[var(--color-gold)]/20 transition-all duration-200 group"
            >
              <div className="text-base mb-1">{elementEmojis[char.element] || '⭐'}</div>
              <p className="text-[10px] font-light text-[var(--color-text)]/60 truncate">{char.name}</p>
              <p className="text-[8px] font-light text-[var(--color-text-secondary)]/30">Lv.{char.level}</p>
              {char.constellation > 0 && (
                <span className="text-[8px] text-[var(--color-gold)]/50">C{char.constellation}</span>
              )}
            </motion.div>
          ))}
          {characters.length > 12 && (
            <div className="flex items-center justify-center p-3 rounded-xl bg-black/10 border border-dashed border-[var(--color-border)] text-[10px] font-light text-[var(--color-text-secondary)]/30">
              +{characters.length - 12}
            </div>
          )}
        </div>
      )}
    </FantasyPanel>
  )
}
