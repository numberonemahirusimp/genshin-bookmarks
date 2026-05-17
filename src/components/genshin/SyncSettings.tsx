import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FantasyPanel } from '../ui/FantasyPanel'
import { GoldButton } from '../ui/GoldButton'
import { GoldDivider } from '../ui/GoldDivider'
import { Sparkles, Key, RefreshCw, Check, AlertCircle } from '../ui/Icons'
import { GenshinAuth, getAuthFromCookies, fetchResinData } from '../../services/genshinApi'
import { db } from '../../store'

interface SyncSettingsProps {
  auth: GenshinAuth | null
  onAuthChange: (auth: GenshinAuth | null) => void
}

export function SyncSettings({ auth, onAuthChange }: SyncSettingsProps) {
  const [ltuid, setLtuid] = useState(auth?.ltuid || '')
  const [ltoken, setLtoken] = useState(auth?.ltoken || '')
  const [uid, setUid] = useState(auth?.uid || '')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'error'>('idle')
  const [testMsg, setTestMsg] = useState('')
  const [detecting, setDetecting] = useState(false)

  useEffect(() => { if (auth) { setLtuid(auth.ltuid); setLtoken(auth.ltoken); setUid(auth.uid) } }, [auth])

  async function handleDetect() {
    setDetecting(true); setTestResult('idle')
    const cookies = await getAuthFromCookies()
    if (cookies) { setLtuid(cookies.ltuid); setLtoken(cookies.ltoken); setUid(cookies.uid); setTestMsg('Tokens detected!'); setTestResult('success') }
    else { setTestMsg('Not logged into Hoyolab. Try manually.'); setTestResult('error') }
    setDetecting(false)
  }

  async function handleTest() {
    if (!ltuid || !ltoken) { setTestMsg('Fill in ltuid and ltoken.'); setTestResult('error'); return }
    setTesting(true); setTestResult('idle')
    const data = await fetchResinData({ ltuid, ltoken, uid })
    if (data) { setTestResult('success'); setTestMsg(`Connected! Resin: ${data.currentResin}/${data.maxResin}`) }
    else { setTestResult('error'); setTestMsg('Connection failed. Check tokens.') }
    setTesting(false)
  }

  async function handleSave() {
    const cookies = await getAuthFromCookies()
    const newAuth: GenshinAuth = { ltuid, ltoken, uid, ltoken_v2: cookies?.ltoken_v2 || undefined, ltuid_v2: cookies?.ltuid_v2 || undefined }
    await db.setSetting('genshinAuth', newAuth)
    onAuthChange(newAuth)
    setTestResult('success'); setTestMsg('Credentials saved.')
  }

  async function handleDisconnect() {
    await db.setSetting('genshinAuth', null)
    onAuthChange(null); setLtuid(''); setLtoken(''); setUid(''); setTestResult('idle'); setTestMsg('')
  }

  return (
    <div className="px-10 pb-24 space-y-6">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="font-display text-xl font-light tracking-wide text-[var(--color-text)]">Genshin Sync</h2>
        <p className="text-sm font-light text-[var(--color-text-secondary)]/40 mt-1">Connect your Hoyolab account</p>
      </motion.div>

      <GoldDivider />

      {auth && (
        <FantasyPanel className="p-5" withCorners={false}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-500/8 border border-green-500/15 flex items-center justify-center">
              <Check size={16} className="text-green-400/60" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-light text-[var(--color-text)]/80">Connected as UID {auth.uid}</p>
              <p className="text-[10px] font-light text-[var(--color-text-secondary)]/30 mt-0.5">Data synced from Hoyolab</p>
            </div>
            <button onClick={handleDisconnect} className="px-3 py-1.5 rounded-xl text-[11px] font-light border border-red-500/20 text-red-400/50 hover:bg-red-500/5 transition-all duration-200">Disconnect</button>
          </div>
        </FantasyPanel>
      )}

      <FantasyPanel className="p-5" withCorners={false}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles size={15} className="text-[var(--color-gold)]/40" />
            <div>
              <p className="text-sm font-light text-[var(--color-text)]/70">Auto-detect from browser</p>
              <p className="text-[10px] font-light text-[var(--color-text-secondary)]/30 mt-0.5">Detects Hoyolab login if signed in</p>
            </div>
          </div>
          <GoldButton size="sm" variant="secondary" onClick={handleDetect} disabled={detecting} icon={<RefreshCw size={12} className={detecting ? 'animate-spin' : ''} />}>
            {detecting ? 'Detecting' : 'Detect'}
          </GoldButton>
        </div>
      </FantasyPanel>

      <FantasyPanel className="p-6" withCorners>
        <div className="flex items-center gap-2 mb-5">
          <Key size={13} className="text-[var(--color-gold)]/40" />
          <h3 className="font-display text-xs font-medium text-[var(--color-gold-light)]/60 tracking-wide uppercase">Manual Configuration</h3>
        </div>

        <div className="space-y-4">
          {(['uid', 'ltuid', 'ltoken'] as const).map(field => (
            <div key={field}>
              <label className="block text-[9px] uppercase tracking-wider text-[var(--color-text-secondary)]/30 mb-1.5 font-light">{field === 'ltoken' ? 'ltoken (Login Token)' : field}</label>
              <input
                type={field === 'ltoken' ? 'password' : 'text'}
                value={field === 'uid' ? uid : field === 'ltuid' ? ltuid : ltoken}
                onChange={e => field === 'uid' ? setUid(e.target.value) : field === 'ltuid' ? setLtuid(e.target.value) : setLtoken(e.target.value)}
                placeholder={field === 'uid' ? 'e.g. 812345678' : 'From hoyolab.com cookies'}
                className="w-full px-3 py-2 rounded-xl bg-black/20 border border-[var(--color-border)] text-sm font-light text-[var(--color-text)]/70 placeholder:text-[var(--color-text-secondary)]/15 outline-none focus:border-[var(--color-gold)]/30 transition-colors"
              />
            </div>
          ))}
        </div>

        <details className="mt-4 group">
          <summary className="text-[9px] font-light text-[var(--color-text-secondary)]/30 cursor-pointer hover:text-[var(--color-text-secondary)]/50 transition-colors">How to find these?</summary>
          <div className="mt-2 p-3 rounded-xl bg-black/15 border border-[var(--color-border)] text-[9px] font-light text-[var(--color-text-secondary)]/40 leading-relaxed space-y-0.5">
            <p>1. Go to <span className="text-[var(--color-gold)]/60">hoyolab.com</span> and log in</p>
            <p>2. DevTools → Application → Cookies → act.hoyolab.com</p>
            <p>3. Copy <span className="text-[var(--color-gold)]/60">ltuid</span> and <span className="text-[var(--color-gold)]/60">ltoken</span> values</p>
            <p>4. Your UID is in your profile URL</p>
          </div>
        </details>

        <div className="flex items-center gap-3 mt-5">
          <GoldButton size="sm" variant="secondary" onClick={handleTest} disabled={testing} icon={<RefreshCw size={12} className={testing ? 'animate-spin' : ''} />}>
            {testing ? 'Testing' : 'Test'}
          </GoldButton>
          <GoldButton size="sm" onClick={handleSave} disabled={!ltuid || !ltoken} icon={<Check size={12} />}>Save</GoldButton>
        </div>

        {testResult !== 'idle' && (
          <div className={`mt-3 flex items-center gap-2 text-[11px] font-light px-3 py-2 rounded-xl ${testResult === 'success' ? 'bg-green-500/8 text-green-400/60 border border-green-500/15' : 'bg-red-500/8 text-red-400/50 border border-red-500/15'}`}>
            {testResult === 'success' ? <Check size={11} /> : <AlertCircle size={11} />}
            {testMsg}
          </div>
        )}
      </FantasyPanel>
    </div>
  )
}
