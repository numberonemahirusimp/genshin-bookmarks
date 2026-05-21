/// <reference types="chrome"/>
import SparkMD5 from 'spark-md5'

export interface GenshinAuth {
  ltuid: string
  ltoken: string
  uid: string
  ltuid_v2?: string
  ltoken_v2?: string
  account_id_v2?: string
  cookie_token_v2?: string
  stoken_v2?: string
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
  weapon?: BuildWeapon
  artifacts?: BuildArtifact[]
  stats?: CharacterStat[]
  source?: 'hoyolab' | 'enka'
  buildAvailable?: boolean
}

export interface BuildWeapon {
  name: string
  icon: string
  rarity: number
  level: number
  refinement: number
  mainStat?: string
  subStat?: string
  baseAtk?: number
}

export interface BuildArtifact {
  id: string
  name: string
  icon: string
  setName: string
  slot: string
  rarity: number
  level: number
  mainStat: string
  mainValue: string
  subStats: CharacterStat[]
}

export interface CharacterStat {
  label: string
  value: string
  extra?: string
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
  if (raw.base || raw.relics) return normalizeChronicleCharacter(raw)

  const weapon = normalizeWeapon(raw.weapon)
  const artifacts = normalizeArtifacts(raw.reliquaries || raw.artifacts)
  const stats = normalizeCharacterStats(raw)

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
    weapon,
    artifacts,
    stats,
    source: 'hoyolab',
    buildAvailable: Boolean(weapon || artifacts.length || stats.length),
  }
}

function normalizeChronicleCharacter(raw: any): CharacterData {
  const base = raw.base || raw
  const weapon = normalizeWeapon(raw.weapon)
  const artifacts = normalizeArtifacts(raw.relics || raw.reliquaries || raw.artifacts)
  const stats = normalizeChronicleStats(raw)

  return {
    id: numberFrom(base.id, raw.id, raw.avatar_id),
    image: stringFrom(base.image, raw.image, raw.card_image, raw.gacha_card),
    icon: stringFrom(base.icon, raw.icon, raw.side_icon, base.side_icon),
    name: stringFrom(base.name, raw.name),
    element: stringFrom(base.element, raw.element),
    level: numberFrom(base.level, raw.level),
    friendship: numberFrom(base.fetter, base.friendship, raw.friendship),
    constellation: numberFrom(base.actived_constellation_num, raw.actived_constellation_num, raw.constellation),
    rarity: numberFrom(base.rarity, base.rank, raw.rarity, raw.rank),
    weapon,
    artifacts,
    stats,
    source: 'hoyolab',
    buildAvailable: Boolean(weapon || artifacts.length || stats.length),
  }
}

function normalizeWeapon(raw: any): BuildWeapon | undefined {
  if (!raw) return undefined
  return {
    name: stringFrom(raw.name),
    icon: stringFrom(raw.icon, raw.image),
    rarity: numberFrom(raw.rarity, raw.rank),
    level: numberFrom(raw.level),
    refinement: numberFrom(raw.refinement, raw.affix_level, raw.promote_level) || 1,
    mainStat: stringFrom(raw.main_property?.property_name, raw.mainProperty?.name),
    subStat: stringFrom(raw.sub_property?.property_name, raw.subProperty?.name),
    baseAtk: numberFrom(raw.main_property?.base, raw.base_atk),
  }
}

function normalizeArtifacts(raw: any): BuildArtifact[] {
  if (!Array.isArray(raw)) return []
  return raw.map((artifact, index) => ({
    id: stringFrom(artifact.id) || `${artifact.name || 'artifact'}-${index}`,
    name: stringFrom(artifact.name),
    icon: stringFrom(artifact.icon, artifact.image),
    setName: stringFrom(artifact.set?.name, artifact.set_name),
    slot: stringFrom(artifact.pos_name, artifact.position, artifact.equip_type) || artifactSlots[numberFrom(artifact.pos) - 1] || artifactSlots[index] || 'Artifact',
    rarity: numberFrom(artifact.rarity, artifact.rank),
    level: numberFrom(artifact.level),
    mainStat: stringFrom(artifact.main_property?.property_name, artifact.mainProperty?.name),
    mainValue: stringFrom(artifact.main_property?.value, artifact.mainProperty?.value),
    subStats: (artifact.sub_property_list || artifact.substats || []).map((stat: any) => ({
      label: stringFrom(stat.property_name, stat.name),
      value: stringFrom(stat.value),
    })),
  }))
}

function normalizeChronicleStats(raw: any): CharacterStat[] {
  const properties = raw.properties || raw.base_properties || []
  if (Array.isArray(properties) && properties.length) return normalizeCharacterStats(raw)

  const base = raw.base || raw
  return [
    { label: 'Element', value: stringFrom(base.element, raw.element) },
    { label: 'Level', value: stringFrom(base.level, raw.level) },
    { label: 'Constellation', value: `C${numberFrom(base.actived_constellation_num, raw.actived_constellation_num, raw.constellation)}` },
    { label: 'Friendship', value: stringFrom(base.fetter, base.friendship, raw.friendship) || '--' },
  ].filter(stat => stat.value)
}

function normalizeCharacterStats(raw: any): CharacterStat[] {
  const properties = raw.properties || raw.base_properties || []
  if (!Array.isArray(properties)) return []
  return properties.map((stat: any) => ({
    label: stringFrom(stat.property_name, stat.name),
    value: stringFrom(stat.final, stat.value, stat.base),
    extra: stringFrom(stat.add, stat.extra),
  })).filter((stat: CharacterStat) => stat.label && stat.value)
}

const artifactSlots = ['Flower', 'Plume', 'Sands', 'Goblet', 'Circlet']

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
    'Cookie': buildCookieHeader(auth),
    'Origin': 'https://act.hoyolab.com',
    'Referer': 'https://act.hoyolab.com/',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  }
}

function buildCookieHeader(auth: GenshinAuth): string {
  return [
    ['ltoken', auth.ltoken],
    ['ltuid', auth.ltuid],
    ['ltoken_v2', auth.ltoken_v2],
    ['ltuid_v2', auth.ltuid_v2],
    ['account_id_v2', auth.account_id_v2],
    ['cookie_token_v2', auth.cookie_token_v2],
    ['stoken_v2', auth.stoken_v2],
  ]
    .filter((item): item is [string, string] => Boolean(item[1]))
    .map(([name, value]) => `${name}=${value}`)
    .join('; ')
}

export async function fetchResinData(auth: GenshinAuth): Promise<ResinData | null> {
  try {
    const server = detectServer(auth.uid)
    const res = await fetch(
      `${BASE_URL}/dailyNote?server=${server}&role_id=${auth.uid}`,
      withHoyolabCredentials({ headers: getHeaders(auth) })
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

    const listRes = await fetch(
      `${BASE_URL}/character/list`,
      withHoyolabCredentials({
        method: 'POST',
        headers: getJsonHeaders(auth),
        body: JSON.stringify({ role_id: auth.uid, server, game_biz: 'hk4e_global' }),
      })
    )
    const listJson: { retcode: number; message: string; data?: { list?: { id: number }[]; avatars?: { id: number }[] } } = await listRes.json()
    const listedCharacters = listJson.data?.list || listJson.data?.avatars || []
    if (listJson.retcode !== 0 || !listedCharacters.length) {
      console.warn('Hoyolab API error fetching character list:', listJson.message, 'retcode:', listJson.retcode)
      return null
    }
    const characterIds = listedCharacters.map(a => a.id).filter(Boolean)
    return fetchCharacterDetails(auth, server, characterIds)
  } catch (err) {
    console.error('Failed to fetch characters:', err)
    return null
  }
}

async function fetchCharacterDetails(auth: GenshinAuth, server: string, characterIds: number[]): Promise<CharacterData[] | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/character/detail`,
      withHoyolabCredentials({
        method: 'POST',
        headers: getJsonHeaders(auth),
        body: JSON.stringify({ character_ids: characterIds, role_id: auth.uid, server, game_biz: 'hk4e_global' }),
      })
    )
    const json: { retcode: number; message: string; data?: { avatars?: any[]; list?: any[] } } = await res.json()
    if (json.retcode !== 0) {
      console.warn('Hoyolab API error:', json.message, 'retcode:', json.retcode)
      return null
    }
    return (json.data?.list ?? json.data?.avatars ?? []).map(normalizeCharacter)
  } catch (err) {
    console.error('Failed to fetch characters:', err)
    return null
  }
}

function getJsonHeaders(auth: GenshinAuth): Record<string, string> {
  return {
    ...getHeaders(auth),
    'Content-Type': 'application/json;charset=utf-8',
    'x-rpc-lang': 'en-us',
  }
}

export async function fetchStats(auth: GenshinAuth): Promise<GenshinStats | null> {
  try {
    const server = detectServer(auth.uid)
    const res = await fetch(
      `${BASE_URL}/index?server=${server}&role_id=${auth.uid}`,
      withHoyolabCredentials({ headers: getHeaders(auth) })
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

  const domains = [
    'https://hoyolab.com',
    'https://act.hoyolab.com',
    'https://www.hoyolab.com',
    'https://bbs-api-os.hoyoverse.com',
    'https://act.hoyoverse.com',
    'https://www.hoyoverse.com',
  ]

  async function tryGetCookie(name: string): Promise<string | null> {
    for (const url of domains) {
      try {
        const cookie = await new Promise<chrome.cookies.Cookie | null>(resolve =>
          chrome.cookies.get({ url, name }, c => resolve(c || null))
        )
        if (cookie?.value) return cookie.value
      } catch {}
    }
    return null
  }

  try {
    const [
      ltoken,
      ltuid,
      ltoken_v2,
      ltuid_v2,
      account_id_v2,
      cookie_token_v2,
      stoken_v2,
    ] = await Promise.all([
      tryGetCookie('ltoken'),
      tryGetCookie('ltuid'),
      tryGetCookie('ltoken_v2'),
      tryGetCookie('ltuid_v2'),
      tryGetCookie('account_id_v2'),
      tryGetCookie('cookie_token_v2'),
      tryGetCookie('stoken_v2'),
    ])

    const accountId = ltuid || ltuid_v2 || account_id_v2
    const loginToken = ltoken || ltoken_v2 || cookie_token_v2 || stoken_v2

    if (!accountId || !loginToken) return null

    const authCookie = buildCookieHeader({
      ltuid: accountId,
      ltoken: loginToken,
      uid: '',
      ltuid_v2: ltuid_v2 || account_id_v2 || undefined,
      ltoken_v2: ltoken_v2 || undefined,
      account_id_v2: account_id_v2 || undefined,
      cookie_token_v2: cookie_token_v2 || undefined,
      stoken_v2: stoken_v2 || undefined,
    })

    // Try to auto-detect Genshin UID from HoYoLab API
    let uid = ''
    try {
      const res = await fetch(
        `https://bbs-api-os.hoyoverse.com/game_record/card/wapi/getGameRecordCard?uid=${accountId}`,
        {
          headers: {
            'Cookie': authCookie,
            'x-rpc-app_version': APP_VERSION,
            'x-rpc-client_type': CLIENT_TYPE,
            'x-rpc-language': 'en-us',
          },
          credentials: 'include',
        }
      )
      const data = await res.json()
      if (data.retcode === 0 && data.data?.list) {
        const genshinAccount = data.data.list.find((g: any) => g.game_id === 2)
        if (genshinAccount) uid = String(genshinAccount.game_role_id)
      }
    } catch {}

    return {
      ltoken: loginToken,
      ltuid: accountId,
      uid,
      ltoken_v2: ltoken_v2 || undefined,
      ltuid_v2: ltuid_v2 || account_id_v2 || undefined,
      account_id_v2: account_id_v2 || undefined,
      cookie_token_v2: cookie_token_v2 || undefined,
      stoken_v2: stoken_v2 || undefined,
    }
  } catch {
    return null
  }
}

function withHoyolabCredentials(init: RequestInit): RequestInit {
  return {
    ...init,
    credentials: 'include',
  }
}

export async function fetchEnkaShowcase(uid: string): Promise<CharacterData[] | null> {
  if (!uid) return null

  try {
    const res = await fetch(`https://enka.network/api/uid/${encodeURIComponent(uid)}/`)
    if (!res.ok) {
      console.warn('Enka API error:', res.status)
      return null
    }

    const json = await res.json()
    const list = Array.isArray(json.avatarInfoList) ? json.avatarInfoList : []
    return list.map(normalizeEnkaCharacter).filter(Boolean) as CharacterData[]
  } catch (err) {
    console.error('Failed to fetch Enka showcase:', err)
    return null
  }
}

function normalizeEnkaCharacter(raw: any): CharacterData {
  const id = numberFrom(raw.avatarId)
  const name = stringFrom(raw.nameTextMapHash) || `Character ${id}`
  const weaponRaw = (raw.equipList || []).find((item: any) => item.weapon)
  const artifactRaw = (raw.equipList || []).filter((item: any) => item.reliquary)
  return {
    id,
    image: '',
    icon: '',
    name,
    element: '',
    level: numberFrom(raw.propMap?.['4001']?.val, raw.level),
    friendship: numberFrom(raw.fetterInfo?.expLevel),
    constellation: Array.isArray(raw.talentIdList) ? raw.talentIdList.length : 0,
    rarity: 5,
    weapon: weaponRaw ? {
      name: stringFrom(weaponRaw.flat?.nameTextMapHash) || 'Equipped Weapon',
      icon: enkaIconUrl(stringFrom(weaponRaw.flat?.icon)),
      rarity: numberFrom(weaponRaw.flat?.rankLevel),
      level: numberFrom(weaponRaw.weapon?.level),
      refinement: numberFrom(Object.values(weaponRaw.weapon?.affixMap || {})[0]) + 1 || 1,
    } : undefined,
    artifacts: artifactRaw.map((item: any, index: number) => ({
      id: stringFrom(item.itemId) || `enka-artifact-${index}`,
      name: stringFrom(item.flat?.nameTextMapHash) || artifactSlots[index] || 'Artifact',
      icon: enkaIconUrl(stringFrom(item.flat?.icon)),
      setName: '',
      slot: artifactSlots[index] || 'Artifact',
      rarity: numberFrom(item.flat?.rankLevel),
      level: numberFrom(item.reliquary?.level) - 1,
      mainStat: stringFrom(item.flat?.reliquaryMainstat?.mainPropId),
      mainValue: '',
      subStats: (item.flat?.reliquarySubstats || []).map((stat: any) => ({
        label: stringFrom(stat.appendPropId),
        value: String(numberFrom(stat.statValue)),
      })),
    })),
    stats: [],
    source: 'enka',
    buildAvailable: true,
  }
}

function enkaIconUrl(icon: string): string {
  return icon ? `https://enka.network/ui/${icon}.png` : ''
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
