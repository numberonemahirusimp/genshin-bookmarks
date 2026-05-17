/// <reference types="chrome"/>
import SparkMD5 from 'spark-md5'

export interface GenshinAuth {
  ltuid: string
  ltoken: string
  uid: string
  ltuid_v2?: string
  ltoken_v2?: string
}

export interface GenshinStats {
  activeDays: number
  achievements: number
  anemoculi: number
  geoculi: number
  electroculi: number
  dendroculi: number
  hydroculi: number
  commonChests: number
  exquisiteChests: number
  preciousChests: number
  luxuriousChests: number
  remarkableChests: number
  unlockedWaypoints: number
  unlockedDomains: number
  spiralAbyss: string
}

export interface ResinData {
  currentResin: number
  maxResin: number
  resinRecoveryTime: string
  finishedTaskNum: number
  totalTaskNum: number
  isExtraTaskRewardReceived: boolean
  remainResinDiscountNum: number
  resinDiscountNumLimit: number
  currentExpeditionNum: number
  maxExpeditionNum: number
  expeditions: Expedition[]
  currentRealmCurrency: number
  maxRealmCurrency: number
  realmRecoveryTime: string
  weekBossResinDiscount: number
}

export interface Expedition {
  avatarSideIcon: string
  status: string
  remainedTime: string
}

export interface CharacterData {
  id: number
  image: string
  icon: string
  name: string
  element: string
  level: number
  friendship: number
  constellation: number
  rarity: number
}

interface ApiResponse<T> {
  retcode: number
  message: string
  data: T
}

function numberFrom(...values: unknown[]): number {
  for (const value of values) {
    if (typeof value === 'number') return value
    if (typeof value === 'string' && value.trim() !== '' && !Number.isNaN(Number(value))) return Number(value)
  }
  return 0
}

function stringFrom(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string') return value
    if (typeof value === 'number') return String(value)
  }
  return ''
}

function boolFrom(...values: unknown[]): boolean {
  for (const value of values) {
    if (typeof value === 'boolean') return value
  }
  return false
}

function normalizeStats(raw: any): GenshinStats {
  return {
    activeDays: numberFrom(raw.activeDays, raw.active_day_number),
    achievements: numberFrom(raw.achievements, raw.achievement_number),
    anemoculi: numberFrom(raw.anemoculi, raw.anemoculus_number),
    geoculi: numberFrom(raw.geoculi, raw.geoculus_number),
    electroculi: numberFrom(raw.electroculi, raw.electroculus_number),
    dendroculi: numberFrom(raw.dendroculi, raw.dendroculus_number),
    hydroculi: numberFrom(raw.hydroculi, raw.hydroculus_number),
    commonChests: numberFrom(raw.commonChests, raw.common_chest_number),
    exquisiteChests: numberFrom(raw.exquisiteChests, raw.exquisite_chest_number),
    preciousChests: numberFrom(raw.preciousChests, raw.precious_chest_number),
    luxuriousChests: numberFrom(raw.luxuriousChests, raw.luxurious_chest_number),
    remarkableChests: numberFrom(raw.remarkableChests, raw.magic_chest_number, raw.remarkable_chest_number),
    unlockedWaypoints: numberFrom(raw.unlockedWaypoints, raw.way_point_number, raw.unlocked_waypoints),
    unlockedDomains: numberFrom(raw.unlockedDomains, raw.domain_number, raw.unlocked_domains),
    spiralAbyss: stringFrom(raw.spiralAbyss, raw.spiral_abyss),
  }
}

function normalizeResin(raw: any): ResinData {
  return {
    currentResin: numberFrom(raw.currentResin, raw.current_resin),
    maxResin: numberFrom(raw.maxResin, raw.max_resin),
    resinRecoveryTime: stringFrom(raw.resinRecoveryTime, raw.resin_recovery_time),
    finishedTaskNum: numberFrom(raw.finishedTaskNum, raw.finished_task_num),
    totalTaskNum: numberFrom(raw.totalTaskNum, raw.total_task_num),
    isExtraTaskRewardReceived: boolFrom(raw.isExtraTaskRewardReceived, raw.is_extra_task_reward_received),
    remainResinDiscountNum: numberFrom(raw.remainResinDiscountNum, raw.remain_resin_discount_num),
    resinDiscountNumLimit: numberFrom(raw.resinDiscountNumLimit, raw.resin_discount_num_limit),
    currentExpeditionNum: numberFrom(raw.currentExpeditionNum, raw.current_expedition_num),
    maxExpeditionNum: numberFrom(raw.maxExpeditionNum, raw.max_expedition_num),
    expeditions: raw.expeditions || [],
    currentRealmCurrency: numberFrom(raw.currentRealmCurrency, raw.current_realm_currency),
    maxRealmCurrency: numberFrom(raw.maxRealmCurrency, raw.max_realm_currency),
    realmRecoveryTime: stringFrom(raw.realmRecoveryTime, raw.realm_recovery_time),
    weekBossResinDiscount: numberFrom(raw.weekBossResinDiscount, raw.remain_resin_discount_num, raw.week_boss_resin_discount),
  }
}

function normalizeCharacter(raw: any): CharacterData {
  return {
    id: numberFrom(raw.id, raw.avatar_id),
    image: stringFrom(raw.image, raw.card_image, raw.gacha_card),
    icon: stringFrom(raw.icon, raw.image, raw.side_icon),
    name: stringFrom(raw.name),
    element: stringFrom(raw.element),
    level: numberFrom(raw.level),
    friendship: numberFrom(raw.friendship, raw.fetter),
    constellation: numberFrom(raw.constellation, raw.actived_constellation_num),
    rarity: numberFrom(raw.rarity, raw.rank),
  }
}

function detectServer(uid: string): string {
  const prefix = uid?.charAt(0)
  if (prefix === '1') return 'os_usa'
  if (prefix === '2') return 'os_euro'
  if (prefix === '5') return 'os_asia'
  if (prefix === '9') return 'os_cht'
  return 'os_asia'
}

const BASE_URL = 'https://bbs-api-os.hoyoverse.com/game_record/genshin/api'
const APP_VERSION = '2.61.1'
const CLIENT_TYPE = '5'
const SALT = 'xV8v4Qu54lUKrEYFZkJhB8cuOh9YAlsT'

function generateDS(): string {
  const t = Math.floor(Date.now() / 1000)
  const r = Math.random().toString(36).slice(2, 8)
  const h = SparkMD5.hash(`salt=${SALT}&t=${t}&r=${r}`)
  return `${h},${t},${r}`
}

function getHeaders(auth: GenshinAuth): Record<string, string> {
  return {
    'Accept': 'application/json, text/plain, */*',
    'x-rpc-app_version': APP_VERSION,
    'x-rpc-client_type': CLIENT_TYPE,
    'x-rpc-language': 'en-us',
    'DS': generateDS(),
    'Cookie': `ltoken=${auth.ltoken}; ltuid=${auth.ltuid}${auth.ltoken_v2 ? `; ltoken_v2=${auth.ltoken_v2}; ltuid_v2=${auth.ltuid_v2}` : ''}`,
    'Origin': 'https://act.hoyolab.com',
    'Referer': 'https://act.hoyolab.com/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  }
}

export async function fetchResinData(auth: GenshinAuth): Promise<ResinData | null> {
  try {
    const server = detectServer(auth.uid)
    const res = await fetch(
      `${BASE_URL}/dailyNote?server=${server}&role_id=${auth.uid}`,
      { headers: getHeaders(auth) }
    )
    const json: ApiResponse<ResinData> = await res.json()
    if (json.retcode !== 0) {
      console.warn('Hoyolab API error:', json.message)
      return null
    }
    return normalizeResin(json.data)
  } catch (err) {
    console.error('Failed to fetch resin data:', err)
    return null
  }
}

export async function fetchCharacters(auth: GenshinAuth): Promise<CharacterData[] | null> {
  try {
    const server = detectServer(auth.uid)

    const indexRes = await fetch(
      `${BASE_URL}/index?server=${server}&role_id=${auth.uid}`,
      { headers: getHeaders(auth) }
    )
    const indexJson: { retcode: number; message: string; data?: { avatars?: { id: number }[] } } = await indexRes.json()
    if (indexJson.retcode !== 0 || !indexJson.data?.avatars) {
      console.warn('Hoyolab API error fetching avatar IDs:', indexJson.message)
      const ids = [10000002, 10000003, 10000005, 10000006, 10000007, 10000014, 10000015, 10000016]
      return fetchCharacterDetails(auth, server, ids)
    }
    const characterIds = indexJson.data.avatars.map(a => a.id)
    return fetchCharacterDetails(auth, server, characterIds)
  } catch (err) {
    console.error('Failed to fetch characters:', err)
    return null
  }
}

async function fetchCharacterDetails(auth: GenshinAuth, server: string, characterIds: number[]): Promise<CharacterData[] | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/character`,
      {
        method: 'POST',
        headers: { ...getHeaders(auth), 'Content-Type': 'application/json' },
        body: JSON.stringify({ character_ids: characterIds, role_id: auth.uid, server })
      }
    )
    const json: { retcode: number; message: string; data?: { avatars?: any[] } } = await res.json()
    if (json.retcode !== 0) {
      console.warn('Hoyolab API error:', json.message, 'retcode:', json.retcode)
      return null
    }
    return (json.data?.avatars ?? []).map(normalizeCharacter)
  } catch (err) {
    console.error('Failed to fetch characters:', err)
    return null
  }
}

export async function fetchStats(auth: GenshinAuth): Promise<GenshinStats | null> {
  try {
    const server = detectServer(auth.uid)
    const res = await fetch(
      `${BASE_URL}/index?server=${server}&role_id=${auth.uid}`,
      { headers: getHeaders(auth) }
    )
    const json: ApiResponse<{ stats: GenshinStats }> = await res.json()
    if (json.retcode !== 0) {
      console.warn('Hoyolab API error:', json.message)
      return null
    }
    return normalizeStats(json.data.stats)
  } catch (err) {
    console.error('Failed to fetch stats:', err)
    return null
  }
}

export async function getAuthFromCookies(): Promise<GenshinAuth | null> {
  if (typeof chrome === 'undefined' || !chrome.cookies) return null

  try {
    const ltoken = await new Promise<string | null>(resolve =>
      chrome.cookies.get({ url: 'https://act.hoyolab.com', name: 'ltoken' },
        cookie => resolve(cookie?.value || null))
    )
    const ltuid = await new Promise<string | null>(resolve =>
      chrome.cookies.get({ url: 'https://act.hoyolab.com', name: 'ltuid' },
        cookie => resolve(cookie?.value || null))
    )
    const uid = await new Promise<string | null>(resolve =>
      chrome.cookies.get({ url: 'https://act.hoyolab.com', name: 'account_mid_v2' },
        cookie => resolve(cookie?.value || null))
    )
    const ltoken_v2 = await new Promise<string | null>(resolve =>
      chrome.cookies.get({ url: 'https://act.hoyolab.com', name: 'ltoken_v2' },
        cookie => resolve(cookie?.value || null))
    )
    const ltuid_v2 = await new Promise<string | null>(resolve =>
      chrome.cookies.get({ url: 'https://act.hoyolab.com', name: 'ltuid_v2' },
        cookie => resolve(cookie?.value || null))
    )

    if (!ltoken || !ltuid) return null
    return { ltoken, ltuid, uid: uid || '', ltoken_v2: ltoken_v2 || undefined, ltuid_v2: ltuid_v2 || undefined }
  } catch {
    return null
  }
}

export const elementColors: Record<string, string> = {
  Anemo: '#a0d8ef',
  Geo: '#f5b041',
  Electro: '#c084fc',
  Dendro: '#6fbf4b',
  Hydro: '#4fc3f7',
  Pyro: '#ff6f4a',
  Cryo: '#81d4fa',
}
