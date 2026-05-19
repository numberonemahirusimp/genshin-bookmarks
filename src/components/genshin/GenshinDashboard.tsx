import { useEffect, useMemo, useState } from 'react'
import {
  CharacterData, fetchCharacters, fetchEnkaShowcase, fetchResinData, fetchStats,
  getAuthFromCookies,
  GenshinAuth, GenshinStats, ResinData,
} from '../../services/genshinApi'
import { db } from '../../store'
import { Archive, BarChart3, Check, Clock, ExternalLink, Gem, RefreshCw, Search, Star, Trophy, User } from '../ui/Icons'

interface GenshinDashboardProps {
  auth: GenshinAuth | null
  onAuthChange: (auth: GenshinAuth | null) => void
}

type TabId = 'overview' | 'resin' | 'roster'

interface ArchiveCharacter {
  id: string
  name: string
  element: string
  weapon: string
  rarity: number
  icon?: string
  level?: number
  constellation?: number
  owned?: boolean
  isNew?: boolean
  build?: CharacterData
  source?: 'hoyolab' | 'enka'
  buildAvailable?: boolean
}

const hoyolabCharacterArchiveUrl = 'https://act.hoyolab.com/app/community-game-records-sea/index.html?bbs_presentation_style=fullscreen&bbs_auth_required=true&gid=2&user_id=10681574&bbs_theme=dark&bbs_theme_device=1#/ys/role/all?role_id=800099194&server=os_asia'

const characterIconUrls: Record<string, string> = {
  'Aether': 'https://static.wikia.nocookie.net/gensin-impact/images/a/a5/Aether_Icon.png/revision/latest?cb=20260208041908',
  'Aino': 'https://static.wikia.nocookie.net/gensin-impact/images/a/a3/Aino_Icon.png/revision/latest?cb=20250910025341',
  'Albedo': 'https://static.wikia.nocookie.net/gensin-impact/images/3/30/Albedo_Icon.png/revision/latest?cb=20260304040635',
  'Alhaitham': 'https://static.wikia.nocookie.net/gensin-impact/images/2/2c/Alhaitham_Icon.png/revision/latest?cb=20231215091456',
  'Aloy': 'https://static.wikia.nocookie.net/gensin-impact/images/e/e5/Aloy_Icon.png/revision/latest?cb=20231215091525',
  'Amber': 'https://static.wikia.nocookie.net/gensin-impact/images/7/75/Amber_Icon.png/revision/latest?cb=20210213161233',
  'Arataki Itto': 'https://static.wikia.nocookie.net/gensin-impact/images/7/7b/Arataki_Itto_Icon.png/revision/latest?cb=20231215091612',
  'Arlecchino': 'https://static.wikia.nocookie.net/gensin-impact/images/9/9a/Arlecchino_Icon.png/revision/latest?cb=20240424041749',
  'Baizhu': 'https://static.wikia.nocookie.net/gensin-impact/images/c/cb/Baizhu_Icon.png/revision/latest?cb=20231215091730',
  'Barbara': 'https://static.wikia.nocookie.net/gensin-impact/images/6/6a/Barbara_Icon.png/revision/latest?cb=20231215091800',
  'Beidou': 'https://static.wikia.nocookie.net/gensin-impact/images/e/e1/Beidou_Icon.png/revision/latest?cb=20231215091828',
  'Bennett': 'https://static.wikia.nocookie.net/gensin-impact/images/7/79/Bennett_Icon.png/revision/latest?cb=20231215091856',
  'Candace': 'https://static.wikia.nocookie.net/gensin-impact/images/d/dd/Candace_Icon.png/revision/latest?cb=20231215092140',
  'Charlotte': 'https://static.wikia.nocookie.net/gensin-impact/images/d/d2/Charlotte_Icon.png/revision/latest?cb=20231108030544',
  'Chasca': 'https://static.wikia.nocookie.net/gensin-impact/images/0/03/Chasca_Icon.png/revision/latest?cb=20241120025626',
  'Chevreuse': 'https://static.wikia.nocookie.net/gensin-impact/images/8/8a/Chevreuse_Icon.png/revision/latest?cb=20231225195348',
  'Chiori': 'https://static.wikia.nocookie.net/gensin-impact/images/8/88/Chiori_Icon.png/revision/latest?cb=20240313015540',
  'Chongyun': 'https://static.wikia.nocookie.net/gensin-impact/images/3/35/Chongyun_Icon.png/revision/latest?cb=20231215092204',
  'Citlali': 'https://static.wikia.nocookie.net/gensin-impact/images/d/dd/Citlali_Icon.png/revision/latest?cb=20241130080542',
  'Clorinde': 'https://static.wikia.nocookie.net/gensin-impact/images/5/5b/Clorinde_Icon.png/revision/latest?cb=20240605020849',
  'Collei': 'https://static.wikia.nocookie.net/gensin-impact/images/a/a2/Collei_Icon.png/revision/latest?cb=20231215092218',
  'Columbina': 'https://static.wikia.nocookie.net/gensin-impact/images/3/35/Columbina_Icon.png/revision/latest?cb=20260114031143',
  'Cyno': 'https://static.wikia.nocookie.net/gensin-impact/images/3/31/Cyno_Icon.png/revision/latest?cb=20231215092240',
  'Dahlia': 'https://static.wikia.nocookie.net/gensin-impact/images/6/6d/Dahlia_Icon.png/revision/latest?cb=20250618025425',
  'Dehya': 'https://static.wikia.nocookie.net/gensin-impact/images/3/3f/Dehya_Icon.png/revision/latest?cb=20231215092328',
  'Diluc': 'https://static.wikia.nocookie.net/gensin-impact/images/3/3d/Diluc_Icon.png/revision/latest?cb=20231215092341',
  'Diona': 'https://static.wikia.nocookie.net/gensin-impact/images/4/40/Diona_Icon.png/revision/latest?cb=20260304040712',
  'Dori': 'https://static.wikia.nocookie.net/gensin-impact/images/5/54/Dori_Icon.png/revision/latest?cb=20231215092725',
  'Durin': 'https://static.wikia.nocookie.net/gensin-impact/images/b/ba/Durin_Icon.png/revision/latest?cb=20251203043105',
  'Emilie': 'https://static.wikia.nocookie.net/gensin-impact/images/a/aa/Emilie_Icon.png/revision/latest?cb=20240806102359',
  'Escoffier': 'https://static.wikia.nocookie.net/gensin-impact/images/2/2a/Escoffier_Icon.png/revision/latest?cb=20250507052556',
  'Eula': 'https://static.wikia.nocookie.net/gensin-impact/images/a/af/Eula_Icon.png/revision/latest?cb=20231215092858',
  'Faruzan': 'https://static.wikia.nocookie.net/gensin-impact/images/b/b2/Faruzan_Icon.png/revision/latest?cb=20231215092917',
  'Fischl': 'https://static.wikia.nocookie.net/gensin-impact/images/9/9a/Fischl_Icon.png/revision/latest?cb=20231215092945',
  'Flins': 'https://static.wikia.nocookie.net/gensin-impact/images/a/af/Flins_Icon.png/revision/latest?cb=20250910175819',
  'Freminet': 'https://static.wikia.nocookie.net/gensin-impact/images/e/ee/Freminet_Icon.png/revision/latest?cb=20231215093001',
  'Furina': 'https://static.wikia.nocookie.net/gensin-impact/images/e/e6/Furina_Icon.png/revision/latest?cb=20231108030656',
  'Gaming': 'https://static.wikia.nocookie.net/gensin-impact/images/7/77/Gaming_Icon.png/revision/latest?cb=20240131020313',
  'Ganyu': 'https://static.wikia.nocookie.net/gensin-impact/images/7/79/Ganyu_Icon.png/revision/latest?cb=20230519012425',
  'Gorou': 'https://static.wikia.nocookie.net/gensin-impact/images/f/fe/Gorou_Icon.png/revision/latest?cb=20211126224331',
  'Hu Tao': 'https://static.wikia.nocookie.net/gensin-impact/images/e/e9/Hu_Tao_Icon.png/revision/latest?cb=20260304040745',
  'Iansan': 'https://static.wikia.nocookie.net/gensin-impact/images/3/38/Iansan_Icon.png/revision/latest?cb=20250326014900',
  'Ifa': 'https://static.wikia.nocookie.net/gensin-impact/images/5/5f/Ifa_Icon.png/revision/latest?cb=20250507052606',
  'Illuga': 'https://static.wikia.nocookie.net/gensin-impact/images/9/96/Illuga_Icon.png/revision/latest?cb=20260114054020',
  'Ineffa': 'https://static.wikia.nocookie.net/gensin-impact/images/0/0b/Ineffa_Icon.png/revision/latest?cb=20250730030204',
  'Jahoda': 'https://static.wikia.nocookie.net/gensin-impact/images/b/bf/Jahoda_Icon.png/revision/latest?cb=20250911004842',
  'Jean': 'https://static.wikia.nocookie.net/gensin-impact/images/6/64/Jean_Icon.png/revision/latest?cb=20260304040810',
  'Kachina': 'https://static.wikia.nocookie.net/gensin-impact/images/1/1a/Kachina_Icon.png/revision/latest?cb=20240828030247',
  'Kaedehara Kazuha': 'https://static.wikia.nocookie.net/gensin-impact/images/e/e3/Kaedehara_Kazuha_Icon.png/revision/latest?cb=20210623063513',
  'Kaeya': 'https://static.wikia.nocookie.net/gensin-impact/images/b/b6/Kaeya_Icon.png/revision/latest?cb=20260304040842',
  'Kamisato Ayaka': 'https://static.wikia.nocookie.net/gensin-impact/images/5/51/Kamisato_Ayaka_Icon.png/revision/latest?cb=20211221231648',
  'Kamisato Ayato': 'https://static.wikia.nocookie.net/gensin-impact/images/2/27/Kamisato_Ayato_Icon.png/revision/latest?cb=20220601033710',
  'Kaveh': 'https://static.wikia.nocookie.net/gensin-impact/images/1/1f/Kaveh_Icon.png/revision/latest?cb=20230502113258',
  'Keqing': 'https://static.wikia.nocookie.net/gensin-impact/images/5/52/Keqing_Icon.png/revision/latest?cb=20210213162751',
  'Kinich': 'https://static.wikia.nocookie.net/gensin-impact/images/9/9a/Kinich_Icon.png/revision/latest?cb=20240917123836',
  'Kirara': 'https://static.wikia.nocookie.net/gensin-impact/images/b/b6/Kirara_Icon.png/revision/latest?cb=20230718042457',
  'Klee': 'https://static.wikia.nocookie.net/gensin-impact/images/9/9c/Klee_Icon.png/revision/latest?cb=20210214011911',
  'Kujou Sara': 'https://static.wikia.nocookie.net/gensin-impact/images/d/df/Kujou_Sara_Icon.png/revision/latest?cb=20220210040844',
  'Kuki Shinobu': 'https://static.wikia.nocookie.net/gensin-impact/images/b/b3/Kuki_Shinobu_Icon.png/revision/latest?cb=20220605061801',
  'Lan Yan': 'https://static.wikia.nocookie.net/gensin-impact/images/e/e6/Lan_Yan_Icon.png/revision/latest?cb=20250128195304',
  'Lauma': 'https://static.wikia.nocookie.net/gensin-impact/images/2/27/Lauma_Icon.png/revision/latest?cb=20250910024154',
  'Layla': 'https://static.wikia.nocookie.net/gensin-impact/images/1/1a/Layla_Icon.png/revision/latest?cb=20221118140544',
  'Linnea': 'https://static.wikia.nocookie.net/gensin-impact/images/a/a9/Linnea_Icon.png/revision/latest?cb=20260408075838',
  'Linnea Side': 'https://static.wikia.nocookie.net/gensin-impact/images/c/c1/Linnea_Side_Icon.png/revision/latest?cb=20260408075913',
  'Lisa': 'https://static.wikia.nocookie.net/gensin-impact/images/6/65/Lisa_Icon.png/revision/latest?cb=20240711205456',
  'Lohen': 'https://static.wikia.nocookie.net/gensin-impact/images/8/86/Lohen_Icon.png/revision/latest?cb=20260225145037',
  'Lumine': 'https://static.wikia.nocookie.net/gensin-impact/images/9/9c/Lumine_Icon.png/revision/latest?cb=20260208041934',
  'Lynette': 'https://static.wikia.nocookie.net/gensin-impact/images/a/ad/Lynette_Icon.png/revision/latest?cb=20230816051019',
  'Lyney': 'https://static.wikia.nocookie.net/gensin-impact/images/b/b2/Lyney_Icon.png/revision/latest?cb=20230816045203',
  'Manekin': 'https://static.wikia.nocookie.net/gensin-impact/images/8/8e/Manekin_Icon.png/revision/latest?cb=20251022054536',
  'Manekina': 'https://static.wikia.nocookie.net/gensin-impact/images/f/f2/Manekina_Icon.png/revision/latest?cb=20251022054637',
  'Mavuika': 'https://static.wikia.nocookie.net/gensin-impact/images/d/da/Mavuika_Icon.png/revision/latest?cb=20250101070636',
  'Mika': 'https://static.wikia.nocookie.net/gensin-impact/images/d/dd/Mika_Icon.png/revision/latest?cb=20230321101835',
  'Mona': 'https://static.wikia.nocookie.net/gensin-impact/images/4/41/Mona_Icon.png/revision/latest?cb=20260304040909',
  'Mualani': 'https://static.wikia.nocookie.net/gensin-impact/images/0/0b/Mualani_Icon.png/revision/latest?cb=20240828030235',
  'Nahida': 'https://static.wikia.nocookie.net/gensin-impact/images/f/f9/Nahida_Icon.png/revision/latest?cb=20221102030809',
  'Navia': 'https://static.wikia.nocookie.net/gensin-impact/images/c/c0/Navia_Icon.png/revision/latest?cb=20231220022117',
  'Nefer': 'https://static.wikia.nocookie.net/gensin-impact/images/5/5b/Nefer_Icon.png/revision/latest?cb=20250911005040',
  'Neuvillette': 'https://static.wikia.nocookie.net/gensin-impact/images/2/21/Neuvillette_Icon.png/revision/latest?cb=20240711205454',
  'Nilou': 'https://static.wikia.nocookie.net/gensin-impact/images/5/58/Nilou_Icon.png/revision/latest?cb=20221014102540',
  'Ningguang': 'https://static.wikia.nocookie.net/gensin-impact/images/e/e0/Ningguang_Icon.png/revision/latest?cb=20260304040948',
  'Noelle': 'https://static.wikia.nocookie.net/gensin-impact/images/8/8e/Noelle_Icon.png/revision/latest?cb=20210214011929',
  'Ororon': 'https://static.wikia.nocookie.net/gensin-impact/images/5/5e/Ororon_Icon.png/revision/latest?cb=20241014100711',
  'Prune': 'https://static.wikia.nocookie.net/gensin-impact/images/9/99/Prune_Icon.png/revision/latest?cb=20260414110812',
  'Qiqi': 'https://static.wikia.nocookie.net/gensin-impact/images/b/b3/Qiqi_Icon.png/revision/latest?cb=20220316020612',
  'Raiden Shogun': 'https://static.wikia.nocookie.net/gensin-impact/images/2/24/Raiden_Shogun_Icon.png/revision/latest?cb=20240717072843',
  'Razor': 'https://static.wikia.nocookie.net/gensin-impact/images/b/b8/Razor_Icon.png/revision/latest?cb=20210214011936',
  'Rosaria': 'https://static.wikia.nocookie.net/gensin-impact/images/3/35/Rosaria_Icon.png/revision/latest?cb=20220601032845',
  'Sangonomiya Kokomi': 'https://static.wikia.nocookie.net/gensin-impact/images/f/ff/Sangonomiya_Kokomi_Icon.png/revision/latest?cb=20210921103819',
  'Sayu': 'https://static.wikia.nocookie.net/gensin-impact/images/2/22/Sayu_Icon.png/revision/latest?cb=20210810101044',
  'Sethos': 'https://static.wikia.nocookie.net/gensin-impact/images/9/90/Sethos_Icon.png/revision/latest?cb=20240605020859',
  'Shenhe': 'https://static.wikia.nocookie.net/gensin-impact/images/a/af/Shenhe_Icon.png/revision/latest?cb=20220210034241',
  'Shikanoin Heizou': 'https://static.wikia.nocookie.net/gensin-impact/images/2/20/Shikanoin_Heizou_Icon.png/revision/latest?cb=20240711205453',
  'Sigewinne': 'https://static.wikia.nocookie.net/gensin-impact/images/3/37/Sigewinne_Icon.png/revision/latest?cb=20240625101835',
  'Skirk': 'https://static.wikia.nocookie.net/gensin-impact/images/0/03/Skirk_Icon.png/revision/latest?cb=20250618025127',
  'Sucrose': 'https://static.wikia.nocookie.net/gensin-impact/images/0/0e/Sucrose_Icon.png/revision/latest?cb=20210213163209',
  'Tartaglia': 'https://static.wikia.nocookie.net/gensin-impact/images/8/85/Tartaglia_Icon.png/revision/latest?cb=20210213163935',
  'Thoma': 'https://static.wikia.nocookie.net/gensin-impact/images/5/5b/Thoma_Icon.png/revision/latest?cb=20211014011046',
  'Tighnari': 'https://static.wikia.nocookie.net/gensin-impact/images/8/87/Tighnari_Icon.png/revision/latest?cb=20220824024817',
  'Traveler': 'https://static.wikia.nocookie.net/gensin-impact/images/5/59/Traveler_Icon.png/revision/latest?cb=20211220013610',
  'Unknown': 'https://static.wikia.nocookie.net/gensin-impact/images/8/84/Unknown_Icon.png/revision/latest?cb=20220509204455',
  'Varesa': 'https://static.wikia.nocookie.net/gensin-impact/images/d/dd/Varesa_Icon.png/revision/latest?cb=20250326014831',
  'Venti': 'https://static.wikia.nocookie.net/gensin-impact/images/f/f1/Venti_Icon.png/revision/latest?cb=20210214011949',
  'Wanderer': 'https://static.wikia.nocookie.net/gensin-impact/images/f/f8/Wanderer_Icon.png/revision/latest?cb=20221207034209',
  'Wonderland Manekin': 'https://static.wikia.nocookie.net/gensin-impact/images/0/02/Wonderland_Manekin_Icon.png/revision/latest?cb=20251022045055',
  'Wriothesley': 'https://static.wikia.nocookie.net/gensin-impact/images/b/bb/Wriothesley_Icon.png/revision/latest?cb=20231017103145',
  'Xiangling': 'https://static.wikia.nocookie.net/gensin-impact/images/3/39/Xiangling_Icon.png/revision/latest?cb=20210214011301',
  'Xianyun': 'https://static.wikia.nocookie.net/gensin-impact/images/d/d3/Xianyun_Icon.png/revision/latest?cb=20240131020302',
  'Xiao': 'https://static.wikia.nocookie.net/gensin-impact/images/f/fd/Xiao_Icon.png/revision/latest?cb=20210214012045',
  'Xilonen': 'https://static.wikia.nocookie.net/gensin-impact/images/a/ab/Xilonen_Icon.png/revision/latest?cb=20241009015637',
  'Xingqiu': 'https://static.wikia.nocookie.net/gensin-impact/images/d/d4/Xingqiu_Icon.png/revision/latest?cb=20260304041029',
  'Xinyan': 'https://static.wikia.nocookie.net/gensin-impact/images/2/24/Xinyan_Icon.png/revision/latest?cb=20260304041110',
  'Yae Miko': 'https://static.wikia.nocookie.net/gensin-impact/images/b/ba/Yae_Miko_Icon.png/revision/latest?cb=20220216025931',
  'Yanfei': 'https://static.wikia.nocookie.net/gensin-impact/images/5/54/Yanfei_Icon.png/revision/latest?cb=20260304041151',
  'Yaoyao': 'https://static.wikia.nocookie.net/gensin-impact/images/8/83/Yaoyao_Icon.png/revision/latest?cb=20230123150446',
  'Yelan': 'https://static.wikia.nocookie.net/gensin-impact/images/d/d3/Yelan_Icon.png/revision/latest?cb=20240711205454',
  'Yoimiya': 'https://static.wikia.nocookie.net/gensin-impact/images/8/88/Yoimiya_Icon.png/revision/latest?cb=20220214235604',
  'Yumemizuki Mizuki': 'https://static.wikia.nocookie.net/gensin-impact/images/f/f6/Yumemizuki_Mizuki_Icon.png/revision/latest?cb=20250212014631',
  'Yun Jin': 'https://static.wikia.nocookie.net/gensin-impact/images/9/9c/Yun_Jin_Icon.png/revision/latest?cb=20220316025919',
  'Zhongli': 'https://static.wikia.nocookie.net/gensin-impact/images/a/a6/Zhongli_Icon.png/revision/latest?cb=20240711205450',
  'Zibai': 'https://static.wikia.nocookie.net/gensin-impact/images/2/22/Zibai_Icon.png/revision/latest?cb=20260203100351',
}


const fallbackArchiveCharacters: ArchiveCharacter[] = [
  { name: 'Aino', element: 'Hydro', weapon: 'Claymore', rarity: 4 },
  { name: 'Albedo', element: 'Geo', weapon: 'Sword', rarity: 5 },
  { name: 'Alhaitham', element: 'Dendro', weapon: 'Sword', rarity: 5 },
  { name: 'Aloy', element: 'Cryo', weapon: 'Bow', rarity: 5 },
  { name: 'Amber', element: 'Pyro', weapon: 'Bow', rarity: 4 },
  { name: 'Arataki Itto', element: 'Geo', weapon: 'Claymore', rarity: 5 },
  { name: 'Arlecchino', element: 'Pyro', weapon: 'Polearm', rarity: 5 },
  { name: 'Baizhu', element: 'Dendro', weapon: 'Catalyst', rarity: 5 },
  { name: 'Barbara', element: 'Hydro', weapon: 'Catalyst', rarity: 4 },
  { name: 'Beidou', element: 'Electro', weapon: 'Claymore', rarity: 4 },
  { name: 'Bennett', element: 'Pyro', weapon: 'Sword', rarity: 4 },
  { name: 'Candace', element: 'Hydro', weapon: 'Polearm', rarity: 4 },
  { name: 'Charlotte', element: 'Cryo', weapon: 'Catalyst', rarity: 4 },
  { name: 'Chasca', element: 'Anemo', weapon: 'Bow', rarity: 5 },
  { name: 'Chevreuse', element: 'Pyro', weapon: 'Polearm', rarity: 4 },
  { name: 'Chiori', element: 'Geo', weapon: 'Sword', rarity: 5 },
  { name: 'Chongyun', element: 'Cryo', weapon: 'Claymore', rarity: 4 },
  { name: 'Citlali', element: 'Cryo', weapon: 'Catalyst', rarity: 5 },
  { name: 'Clorinde', element: 'Electro', weapon: 'Sword', rarity: 5 },
  { name: 'Collei', element: 'Dendro', weapon: 'Bow', rarity: 4 },
  { name: 'Columbina', element: 'Hydro', weapon: 'Catalyst', rarity: 5 },
  { name: 'Cyno', element: 'Electro', weapon: 'Polearm', rarity: 5 },
  { name: 'Dahlia', element: 'Hydro', weapon: 'Sword', rarity: 4 },
  { name: 'Dehya', element: 'Pyro', weapon: 'Claymore', rarity: 5 },
  { name: 'Diluc', element: 'Pyro', weapon: 'Claymore', rarity: 5 },
  { name: 'Diona', element: 'Cryo', weapon: 'Bow', rarity: 4 },
  { name: 'Dori', element: 'Electro', weapon: 'Claymore', rarity: 4 },
  { name: 'Durin', element: 'Pyro', weapon: 'Sword', rarity: 5 },
  { name: 'Emilie', element: 'Dendro', weapon: 'Polearm', rarity: 5 },
  { name: 'Escoffier', element: 'Cryo', weapon: 'Polearm', rarity: 5 },
  { name: 'Eula', element: 'Cryo', weapon: 'Claymore', rarity: 5 },
  { name: 'Faruzan', element: 'Anemo', weapon: 'Bow', rarity: 4 },
  { name: 'Fischl', element: 'Electro', weapon: 'Bow', rarity: 4 },
  { name: 'Flins', element: 'Electro', weapon: 'Polearm', rarity: 5 },
  { name: 'Freminet', element: 'Cryo', weapon: 'Claymore', rarity: 4 },
  { name: 'Furina', element: 'Hydro', weapon: 'Sword', rarity: 5 },
  { name: 'Gaming', element: 'Pyro', weapon: 'Claymore', rarity: 4 },
  { name: 'Ganyu', element: 'Cryo', weapon: 'Bow', rarity: 5 },
  { name: 'Gorou', element: 'Geo', weapon: 'Bow', rarity: 4 },
  { name: 'Hu Tao', element: 'Pyro', weapon: 'Polearm', rarity: 5 },
  { name: 'Iansan', element: 'Electro', weapon: 'Polearm', rarity: 4 },
  { name: 'Ifa', element: 'Anemo', weapon: 'Catalyst', rarity: 4 },
  { name: 'Illuga', element: 'Geo', weapon: 'Polearm', rarity: 4 },
  { name: 'Ineffa', element: 'Electro', weapon: 'Polearm', rarity: 5 },
  { name: 'Jahoda', element: 'Anemo', weapon: 'Bow', rarity: 4 },
  { name: 'Jean', element: 'Anemo', weapon: 'Sword', rarity: 5 },
  { name: 'Kachina', element: 'Geo', weapon: 'Polearm', rarity: 4 },
  { name: 'Kaedehara Kazuha', element: 'Anemo', weapon: 'Sword', rarity: 5 },
  { name: 'Kaeya', element: 'Cryo', weapon: 'Sword', rarity: 4 },
  { name: 'Kamisato Ayaka', element: 'Cryo', weapon: 'Sword', rarity: 5 },
  { name: 'Kamisato Ayato', element: 'Hydro', weapon: 'Sword', rarity: 5 },
  { name: 'Kaveh', element: 'Dendro', weapon: 'Claymore', rarity: 4 },
  { name: 'Keqing', element: 'Electro', weapon: 'Sword', rarity: 5 },
  { name: 'Kinich', element: 'Dendro', weapon: 'Claymore', rarity: 5 },
  { name: 'Kirara', element: 'Dendro', weapon: 'Sword', rarity: 4 },
  { name: 'Klee', element: 'Pyro', weapon: 'Catalyst', rarity: 5 },
  { name: 'Kujou Sara', element: 'Electro', weapon: 'Bow', rarity: 4 },
  { name: 'Kuki Shinobu', element: 'Electro', weapon: 'Sword', rarity: 4 },
  { name: 'Lan Yan', element: 'Anemo', weapon: 'Catalyst', rarity: 4 },
  { name: 'Lauma', element: 'Dendro', weapon: 'Catalyst', rarity: 5 },
  { name: 'Layla', element: 'Cryo', weapon: 'Sword', rarity: 4 },
  { name: 'Linnea', element: 'Geo', weapon: 'Bow', rarity: 5, isNew: true },
  { name: 'Lisa', element: 'Electro', weapon: 'Catalyst', rarity: 4 },
  { name: 'Lynette', element: 'Anemo', weapon: 'Sword', rarity: 4 },
  { name: 'Lyney', element: 'Pyro', weapon: 'Bow', rarity: 5 },
  { name: 'Mavuika', element: 'Pyro', weapon: 'Claymore', rarity: 5 },
  { name: 'Mika', element: 'Cryo', weapon: 'Polearm', rarity: 4 },
  { name: 'Mona', element: 'Hydro', weapon: 'Catalyst', rarity: 5 },
  { name: 'Mualani', element: 'Hydro', weapon: 'Catalyst', rarity: 5 },
  { name: 'Nahida', element: 'Dendro', weapon: 'Catalyst', rarity: 5 },
  { name: 'Navia', element: 'Geo', weapon: 'Claymore', rarity: 5 },
  { name: 'Nefer', element: 'Dendro', weapon: 'Catalyst', rarity: 5 },
  { name: 'Neuvillette', element: 'Hydro', weapon: 'Catalyst', rarity: 5 },
  { name: 'Nilou', element: 'Hydro', weapon: 'Sword', rarity: 5 },
  { name: 'Ningguang', element: 'Geo', weapon: 'Catalyst', rarity: 4 },
  { name: 'Noelle', element: 'Geo', weapon: 'Claymore', rarity: 4 },
  { name: 'Ororon', element: 'Electro', weapon: 'Bow', rarity: 4 },
  { name: 'Qiqi', element: 'Cryo', weapon: 'Sword', rarity: 5 },
  { name: 'Raiden Shogun', element: 'Electro', weapon: 'Polearm', rarity: 5 },
  { name: 'Razor', element: 'Electro', weapon: 'Claymore', rarity: 4 },
  { name: 'Rosaria', element: 'Cryo', weapon: 'Polearm', rarity: 4 },
  { name: 'Sangonomiya Kokomi', element: 'Hydro', weapon: 'Catalyst', rarity: 5 },
  { name: 'Sayu', element: 'Anemo', weapon: 'Claymore', rarity: 4 },
  { name: 'Sethos', element: 'Electro', weapon: 'Bow', rarity: 4 },
  { name: 'Shenhe', element: 'Cryo', weapon: 'Polearm', rarity: 5 },
  { name: 'Shikanoin Heizou', element: 'Anemo', weapon: 'Catalyst', rarity: 4 },
  { name: 'Sigewinne', element: 'Hydro', weapon: 'Bow', rarity: 5 },
  { name: 'Skirk', element: 'Cryo', weapon: 'Sword', rarity: 5 },
  { name: 'Sucrose', element: 'Anemo', weapon: 'Catalyst', rarity: 4 },
  { name: 'Tartaglia', element: 'Hydro', weapon: 'Bow', rarity: 5 },
  { name: 'Thoma', element: 'Pyro', weapon: 'Polearm', rarity: 4 },
  { name: 'Tighnari', element: 'Dendro', weapon: 'Bow', rarity: 5 },
  { name: 'Traveler', element: 'None', weapon: 'Sword', rarity: 5 },
  { name: 'Varesa', element: 'Electro', weapon: 'Catalyst', rarity: 5 },
  { name: 'Varka', element: 'Anemo', weapon: 'Claymore', rarity: 5 },
  { name: 'Venti', element: 'Anemo', weapon: 'Bow', rarity: 5 },
  { name: 'Wanderer', element: 'Anemo', weapon: 'Catalyst', rarity: 5 },
  { name: 'Wonderland Manekin', element: 'None', weapon: 'Sword', rarity: 5 },
  { name: 'Wriothesley', element: 'Cryo', weapon: 'Catalyst', rarity: 5 },
  { name: 'Xiangling', element: 'Pyro', weapon: 'Polearm', rarity: 4 },
  { name: 'Xianyun', element: 'Anemo', weapon: 'Catalyst', rarity: 5 },
  { name: 'Xiao', element: 'Anemo', weapon: 'Polearm', rarity: 5 },
  { name: 'Xilonen', element: 'Geo', weapon: 'Sword', rarity: 5 },
  { name: 'Xingqiu', element: 'Hydro', weapon: 'Sword', rarity: 4 },
  { name: 'Xinyan', element: 'Pyro', weapon: 'Claymore', rarity: 4 },
  { name: 'Yae Miko', element: 'Electro', weapon: 'Catalyst', rarity: 5 },
  { name: 'Yanfei', element: 'Pyro', weapon: 'Catalyst', rarity: 4 },
  { name: 'Yaoyao', element: 'Dendro', weapon: 'Polearm', rarity: 4 },
  { name: 'Yelan', element: 'Hydro', weapon: 'Bow', rarity: 5 },
  { name: 'Yoimiya', element: 'Pyro', weapon: 'Bow', rarity: 5 },
  { name: 'Yumemizuki Mizuki', element: 'Anemo', weapon: 'Catalyst', rarity: 5 },
  { name: 'Yun Jin', element: 'Geo', weapon: 'Polearm', rarity: 4 },
  { name: 'Zhongli', element: 'Geo', weapon: 'Polearm', rarity: 5 },
  { name: 'Zibai', element: 'Geo', weapon: 'Sword', rarity: 5 },
].map(character => ({
  id: character.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  icon: characterIconUrls[character.name] || characterIconUrls.Unknown,
  ...character,
}))

export function GenshinDashboard({ auth, onAuthChange }: GenshinDashboardProps) {
  const [ltuid, setLtuid] = useState(auth?.ltuid || '')
  const [ltoken, setLtoken] = useState(auth?.ltoken || '')
  const [uid, setUid] = useState(auth?.uid || '')
  const [tab, setTab] = useState<TabId>('overview')
  const [loading, setLoading] = useState(false)
  const [detecting, setDetecting] = useState(false)
  const [detectMessage, setDetectMessage] = useState('')
  const [resin, setResin] = useState<ResinData | null>(null)
  const [stats, setStats] = useState<GenshinStats | null>(null)
  const [characters, setCharacters] = useState<CharacterData[]>([])
  const [showAccountRoster, setShowAccountRoster] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState<ArchiveCharacter | null>(null)
  const [manualResin, setManualResin] = useLocalState('genshin-manual-resin', 120)
  const [tasks, setTasks] = useLocalState<Record<string, boolean>>('genshin-task-board', {})

  useEffect(() => {
    if (!auth) return
    let cancelled = false
    setLoading(true)
    Promise.all([
      fetchResinData(auth),
      fetchStats(auth),
      fetchCharacters(auth),
      fetchEnkaShowcase(auth.uid),
    ]).then(([resinData, statsData, characterData, showcaseData]) => {
      if (cancelled) return
      const mergedCharacters = mergeCharacterBuilds(characterData || [], showcaseData || [])
      setResin(resinData)
      setStats(statsData)
      setCharacters(mergedCharacters)
      if (mergedCharacters.length) setShowAccountRoster(true)
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [auth])

  const displayedResin = resin?.currentResin ?? manualResin
  const maxResin = resin?.maxResin ?? 200
  const resinPercent = Math.round((displayedResin / maxResin) * 100)
  const accountCharacters = useMemo(() => {
    return characters.map(character => ({
      id: String(character.id || character.name),
      name: character.name,
      element: character.element || 'Unknown',
      weapon: 'All',
      rarity: character.rarity || 5,
      icon: character.icon || character.image || characterIconUrls[character.name] || characterIconUrls.Unknown,
      level: character.level,
      constellation: character.constellation,
      owned: true,
      build: character,
      source: character.source,
      buildAvailable: character.buildAvailable,
    }))
  }, [characters])
  const rosterCharacters = useMemo(() => {
    if (showAccountRoster && accountCharacters.length) return accountCharacters
    const ownedNames = new Set(accountCharacters.map(character => character.name))
    return fallbackArchiveCharacters.map(character => ({
      ...character,
      owned: ownedNames.has(character.name),
      build: accountCharacters.find(owned => owned.name === character.name)?.build,
    }))
  }, [accountCharacters, showAccountRoster])

  if (!auth) {
    return (
      <div className="archive-page">
        <div className="archive-card mx-auto max-w-xl p-7">
          <div className="mb-7">
            <h1 className="archive-title">Connect Hoyolab</h1>
            <p className="archive-subtitle">Save your credentials locally to unlock the interactive Genshin screen.</p>
          </div>

          <div className="space-y-4">
            {(['uid', 'ltuid', 'ltoken'] as const).map((field) => (
              <label key={field} className="ui-sans block text-xs uppercase tracking-[0.12em]" style={{ color: 'rgba(216,200,175,0.62)' }}>
                {field === 'uid' ? 'UID (in-game, e.g. 812345678)' : field === 'ltuid' ? 'ltuid (HoYoLab account ID)' : 'ltoken (login token)'}
                <input
                  value={field === 'uid' ? uid : field === 'ltuid' ? ltuid : ltoken}
                  onChange={(event) => {
                    const value = event.target.value
                    if (field === 'uid') setUid(value)
                    else if (field === 'ltuid') setLtuid(value)
                    else setLtoken(value)
                  }}
                  placeholder={field === 'uid' ? 'Your Genshin UID - numeric, found in-game' : 'From browser cookies'}
                  className="mt-2 w-full rounded-lg border bg-black/20 px-4 py-3 text-sm normal-case tracking-normal outline-none"
                  style={{ borderColor: 'rgba(229,194,137,0.18)', color: 'rgba(255,249,237,0.86)' }}
                />
              </label>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={async () => {
                setDetecting(true)
                setDetectMessage('')
                const cookies = await getAuthFromCookies()
                if (cookies) {
                  setLtuid(cookies.ltuid)
                  setLtoken(cookies.ltoken)
                  if (cookies.uid) setUid(cookies.uid)
                  setDetectMessage(cookies.uid ? 'Detected your HoYoLAB login and UID.' : 'Detected your HoYoLAB login. Add your in-game UID, then save.')
                } else {
                  setDetectMessage('Could not detect HoYoLAB login. Log into HoYoLAB in this browser, reload the extension, then try again.')
                }
                setDetecting(false)
              }}
              disabled={detecting}
              className="archive-pill ui-sans flex items-center gap-2 px-4 py-2 text-xs"
              type="button"
              style={{ opacity: detecting ? 0.5 : 1 }}
            >
              <RefreshCw size={12} style={detecting ? { animation: 'spin 1s linear infinite' } : {}} />
              {detecting ? 'Detecting...' : 'Detect from Browser'}
            </button>
            <button
              onClick={async () => {
                const cookies = await getAuthFromCookies()
                const nextAuth: GenshinAuth = {
                  ltuid, ltoken, uid,
                  ltoken_v2: cookies?.ltoken_v2 || undefined,
                  ltuid_v2: cookies?.ltuid_v2 || undefined,
                  account_id_v2: cookies?.account_id_v2 || undefined,
                  cookie_token_v2: cookies?.cookie_token_v2 || undefined,
                  stoken_v2: cookies?.stoken_v2 || undefined,
                }
                await db.setSetting('genshinAuth', nextAuth)
                onAuthChange(nextAuth)
              }}
              disabled={!ltuid || !ltoken || !uid}
              className="archive-pill ui-sans px-5 text-sm"
              style={{ opacity: !ltuid || !ltoken || !uid ? 0.45 : 1 }}
              type="button"
            >
              Save & Connect
            </button>
          </div>

          {detectMessage && (
            <p className="ui-sans mt-3 text-xs" style={{ color: detectMessage.startsWith('Could not') ? 'rgba(255,184,184,0.78)' : 'rgba(185,235,198,0.78)' }}>
              {detectMessage}
            </p>
          )}

          <details className="mt-5 ui-sans" style={{ color: 'rgba(216,200,175,0.45)' }}>
            <summary className="text-[10px] cursor-pointer hover:text-[rgba(216,200,175,0.65)] transition-colors">Where do I find these?</summary>
            <div className="mt-2 p-3 rounded-lg bg-black/15 border text-[10px] leading-relaxed space-y-1" style={{ borderColor: 'rgba(229,194,137,0.12)' }}>
              <p><strong style={{ color: 'rgba(216,200,175,0.65)' }}>UID:</strong> Open Genshin Impact - Paimon menu (top-left) - your UID is at the bottom</p>
              <p><strong style={{ color: 'rgba(216,200,175,0.65)' }}>ltuid & ltoken:</strong> Log into <a href="https://www.hoyolab.com" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'rgba(229,194,137,0.6)' }}>hoyolab.com</a> in this browser, then click "Detect from Browser" above</p>
              <p><strong style={{ color: 'rgba(216,200,175,0.65)' }}>Or manually:</strong> Browser DevTools - Application - Cookies - hoyolab.com - find <code>ltuid</code> and <code>ltoken</code></p>
            </div>
          </details>
        </div>
      </div>
    )
  }

  return (
    <div className="archive-page">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="archive-title">Traveler Console</h1>
          <p className="archive-subtitle">UID {auth.uid || 'Unknown'} {loading ? '- syncing' : ''}</p>
        </div>
        <div className="flex items-center gap-2">
          {(['overview', 'resin', 'roster'] as TabId[]).map(item => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className="archive-pill ui-sans px-4 text-sm capitalize"
              style={{ borderColor: tab === item ? 'rgba(229,194,137,0.5)' : 'rgba(229,194,137,0.2)' }}
              type="button"
            >
              {item}
            </button>
          ))}
          <button
            onClick={async () => {
              await db.setSetting('genshinAuth', null)
              onAuthChange(null)
            }}
            className="archive-pill ui-sans px-4 text-sm"
            style={{ color: 'rgba(255,184,184,0.82)' }}
            type="button"
          >
            Disconnect
          </button>
        </div>
      </div>

      {tab === 'overview' && (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Panel title="Daily Readiness" icon={Check}>
            <TaskBoard tasks={tasks} setTasks={setTasks} />
          </Panel>
          <Panel title="Account Snapshot" icon={Trophy}>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Achievements" value={stats?.achievements ?? 0} />
              <Stat label="Active days" value={stats?.activeDays ?? 0} />
              <Stat label="Waypoints" value={stats?.unlockedWaypoints ?? 0} />
              <Stat label="Abyss" value={stats?.spiralAbyss || '--'} />
            </div>
          </Panel>
          <Panel title="Resin Flow" icon={Gem}>
            <ResinControl value={displayedResin} max={maxResin} percent={resinPercent} onManualChange={setManualResin} live={!!resin} />
          </Panel>
          <Panel title="Expeditions" icon={Clock}>
            <ExpeditionPanel resin={resin} />
          </Panel>
        </div>
      )}

      {tab === 'resin' && (
        <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <Panel title="Resin Planner" icon={Gem}>
            <ResinControl value={displayedResin} max={maxResin} percent={resinPercent} onManualChange={setManualResin} live={!!resin} large />
          </Panel>
          <Panel title="Spend Ideas" icon={Archive}>
            <SpendIdeas resin={displayedResin} />
          </Panel>
        </div>
      )}

      {tab === 'roster' && (
        <CharacterArchive
          characters={rosterCharacters}
          synced={characters.length > 0}
          showAccountRoster={showAccountRoster}
          onModeChange={setShowAccountRoster}
          selectedCharacter={selectedCharacter}
          onSelectCharacter={setSelectedCharacter}
        />
      )}
    </div>
  )
}

function mergeCharacterBuilds(hoyolabCharacters: CharacterData[], showcaseCharacters: CharacterData[]): CharacterData[] {
  if (!showcaseCharacters.length) return hoyolabCharacters
  const showcaseById = new Map(showcaseCharacters.map(character => [character.id, character]))
  return hoyolabCharacters.map(character => {
    const showcase = showcaseById.get(character.id)
    if (!showcase) return character
    return {
      ...character,
      weapon: character.weapon || showcase.weapon,
      artifacts: character.artifacts?.length ? character.artifacts : showcase.artifacts,
      stats: character.stats?.length ? character.stats : showcase.stats,
      source: character.buildAvailable ? character.source : showcase.source,
      buildAvailable: Boolean(character.buildAvailable || showcase.buildAvailable),
    }
  })
}

const archiveElementColors: Record<string, string> = {
  Pyro: '#ff704d',
  Hydro: '#58bfff',
  Anemo: '#78dec7',
  Electro: '#b98cff',
  Dendro: '#9ed65b',
  Cryo: '#9fe8ff',
  Geo: '#e8bd62',
  None: '#c8bca5',
  Unknown: '#c8bca5',
}

function CharacterArchive({
  characters,
  synced,
  showAccountRoster,
  onModeChange,
  selectedCharacter,
  onSelectCharacter,
}: {
  characters: ArchiveCharacter[]
  synced: boolean
  showAccountRoster: boolean
  onModeChange: (showAccountRoster: boolean) => void
  selectedCharacter: ArchiveCharacter | null
  onSelectCharacter: (character: ArchiveCharacter | null) => void
}) {
  const [elementFilter, setElementFilter] = useState('All')
  const [weaponFilter, setWeaponFilter] = useState('All')
  const [rarityFilter, setRarityFilter] = useState('All')
  const [query, setQuery] = useState('')

  const elements = ['All', ...Array.from(new Set(characters.map(character => character.element))).filter(Boolean)]
  const weapons = ['All', ...Array.from(new Set(characters.map(character => character.weapon))).filter(Boolean)]
  const visibleCharacters = characters.filter(character => {
    const matchesElement = elementFilter === 'All' || character.element === elementFilter
    const matchesWeapon = weaponFilter === 'All' || character.weapon === weaponFilter
    const matchesRarity = rarityFilter === 'All' || String(character.rarity) === rarityFilter
    const matchesQuery = character.name.toLowerCase().includes(query.trim().toLowerCase())
    return matchesElement && matchesWeapon && matchesRarity && matchesQuery
  })

  return (
    <section className="character-archive archive-card">
      <div className="character-archive-header">
        <div className="character-archive-title">
          <SparkleGlyph />
          <div>
            <h2>Character Archive</h2>
            <p>{synced ? 'Synced characters from HoYoLAB' : 'View all characters and their details'}</p>
          </div>
        </div>
        <div className="character-archive-actions">
          <button
            className="archive-pill ui-sans px-4 text-xs"
            type="button"
            onClick={() => onModeChange(false)}
            style={{ borderColor: !showAccountRoster ? 'rgba(229,194,137,0.5)' : 'rgba(229,194,137,0.2)' }}
          >
            All Characters
          </button>
          <button
            className="archive-pill ui-sans px-4 text-xs"
            type="button"
            onClick={() => onModeChange(true)}
            disabled={!synced}
            style={{ opacity: synced ? 1 : 0.45, borderColor: showAccountRoster ? 'rgba(229,194,137,0.5)' : 'rgba(229,194,137,0.2)' }}
          >
            My Account
          </button>
          <a href={hoyolabCharacterArchiveUrl} target="_blank" rel="noreferrer">
            HoYoLAB <ExternalLink size={13} />
          </a>
        </div>
      </div>

      <div className="character-archive-controls">
        <ArchiveSelect label="Rarity" value={rarityFilter} onChange={setRarityFilter} options={['All', '5', '4']} />
        <ArchiveSelect label="Element" value={elementFilter} onChange={setElementFilter} options={elements} />
        <ArchiveSelect label="Weapon" value={weaponFilter} onChange={setWeaponFilter} options={weapons} />
        <label className="character-search">
          <Search size={15} />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search character..." />
        </label>
      </div>

      <div className="character-archive-grid">
        {visibleCharacters.map(character => (
          <button
            className="character-archive-tile"
            key={character.id}
            onClick={() => onSelectCharacter(character)}
            type="button"
            style={{ '--character-element': archiveElementColors[character.element] || archiveElementColors.Unknown } as React.CSSProperties}
          >
            <div className="character-portrait">
              {character.icon ? (
                <img src={character.icon} alt="" />
              ) : (
                <span>{character.name.slice(0, 1)}</span>
              )}
              <small>{character.element}</small>
            </div>
            <div className="character-name">{character.name}</div>
            <div className="character-meta">
              {character.owned ? `Lv. ${character.level || 1} · C${character.constellation || 0}` : character.weapon}
            </div>
            {character.isNew && <span className="character-new">New</span>}
          </button>
        ))}
      </div>

      {selectedCharacter && (
        <CharacterBuildMenu character={selectedCharacter} onClose={() => onSelectCharacter(null)} />
      )}

      <div className="character-archive-footer">
        <span />
        <i />
        <i />
        <i />
        <i />
        <span />
      </div>
    </section>
  )
}

function CharacterBuildMenu({ character, onClose }: { character: ArchiveCharacter; onClose: () => void }) {
  const build = character.build
  const stats = build?.stats?.length ? build.stats : fallbackStatsFor(character)
  const artifacts = build?.artifacts || []
  const weapon = build?.weapon

  return (
    <div className="character-build-overlay" role="dialog" aria-modal="true">
      <div className="character-build-panel">
        <div className="character-build-art is-icon">
          {character.icon && <img src={character.icon} alt={character.name} />}
          <div className="character-build-fade" />
          <button className="character-build-close" onClick={onClose} type="button">Close</button>
          <div className="character-build-friendship">Friendship Level: {build?.friendship || character.build?.friendship || '--'}</div>
        </div>

        <div className="character-build-info">
          <div className="character-build-heading">
            <div className="character-build-element" style={{ '--character-element': archiveElementColors[character.element] || archiveElementColors.Unknown } as React.CSSProperties}>
              {character.element.slice(0, 1)}
            </div>
            <div>
              <h3>{character.name}</h3>
              <div className="character-build-stars">{'★'.repeat(character.rarity || 5)}</div>
            </div>
            <span>Lv. {character.level || build?.level || '--'}</span>
          </div>

          <section className="character-build-section">
            <div className="character-build-section-title">Character Stats</div>
            <div className="character-stat-grid">
              {stats.map(stat => (
                <div className="character-stat-row" key={`${stat.label}-${stat.value}`}>
                  <span>{stat.label}</span>
                  <strong>{stat.value}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="character-build-section">
            <div className="character-build-section-title">Weapon</div>
            {weapon ? (
              <div className="character-weapon-card">
                {weapon.icon && <img src={weapon.icon} alt="" />}
                <div>
                  <h4>{weapon.name}</h4>
                  <p>Lv. {weapon.level || '--'} · R{weapon.refinement || 1}</p>
                  {(weapon.subStat || weapon.mainStat) && <p>{weapon.subStat || weapon.mainStat}</p>}
                </div>
              </div>
            ) : (
              <p className="character-build-empty">No weapon build data was returned yet.</p>
            )}
          </section>

          <section className="character-build-section">
            <div className="character-build-section-title">Artifacts</div>
            {artifacts.length ? (
              <div className="character-artifact-grid">
                {artifacts.map(artifact => (
                  <div className="character-artifact-card" key={artifact.id}>
                    {artifact.icon && <img src={artifact.icon} alt="" />}
                    <div>
                      <strong>{artifact.slot}</strong>
                      <span>{artifact.mainStat} {artifact.mainValue}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="character-build-empty">
                Builds only appear when HoYoLAB returns equipment data or the character is visible on your public Enka showcase.
              </p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}

function fallbackStatsFor(character: ArchiveCharacter) {
  return [
    { label: 'Element', value: character.element },
    { label: 'Weapon', value: character.weapon },
    { label: 'Constellation', value: character.owned ? `C${character.constellation || 0}` : 'Not synced' },
    { label: 'Build Source', value: character.source === 'enka' ? 'Enka showcase' : character.buildAvailable ? 'HoYoLAB' : 'Unavailable' },
  ]
}

function ArchiveSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="archive-select">
      <span>{label}</span>
      <select value={value} onChange={event => onChange(event.target.value)}>
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  )
}

function SparkleGlyph() {
  return (
    <div className="character-sparkle" aria-hidden="true">
      <span />
      <span />
    </div>
  )
}

function Panel({ title, icon: Icon, children }: { title: string; icon: typeof Archive; children: React.ReactNode }) {
  return (
    <section className="archive-card p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon size={18} style={{ color: 'rgba(229,194,137,0.9)' }} />
        <h2 className="ui-sans text-sm uppercase tracking-[0.12em]" style={{ color: 'rgba(255,249,237,0.84)' }}>{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border p-4" style={{ borderColor: 'rgba(229,194,137,0.15)' }}>
      <div className="text-2xl" style={{ color: 'rgba(255,249,237,0.92)' }}>{value}</div>
      <div className="ui-sans text-xs" style={{ color: 'rgba(216,200,175,0.52)' }}>{label}</div>
    </div>
  )
}

function TaskBoard({ tasks, setTasks }: { tasks: Record<string, boolean>; setTasks: (tasks: Record<string, boolean>) => void }) {
  const list = ['Commissions', 'Resin', 'Parametric Transformer', 'Realm Currency', 'Expeditions']
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {list.map(task => (
        <button
          key={task}
          onClick={() => setTasks({ ...tasks, [task]: !tasks[task] })}
          className="ui-sans flex items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm"
          style={{
            borderColor: tasks[task] ? 'rgba(139,211,159,0.35)' : 'rgba(229,194,137,0.15)',
            color: tasks[task] ? 'rgba(185,235,198,0.9)' : 'rgba(255,249,237,0.78)',
          }}
          type="button"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full border" style={{ borderColor: 'currentColor' }}>
            {tasks[task] && <Check size={12} />}
          </span>
          {task}
        </button>
      ))}
    </div>
  )
}

function ResinControl({ value, max, percent, onManualChange, live, large = false }: {
  value: number
  max: number
  percent: number
  onManualChange: (value: number) => void
  live: boolean
  large?: boolean
}) {
  return (
    <div className="ui-sans">
      <div className="flex items-end justify-between">
        <div>
          <div className={large ? 'text-6xl' : 'text-4xl'} style={{ color: 'rgba(255,249,237,0.94)' }}>{value}/{max}</div>
          <div className="mt-1 text-xs" style={{ color: 'rgba(216,200,175,0.55)' }}>{live ? 'Synced from Hoyolab' : 'Manual fallback mode'}</div>
        </div>
        <RefreshCw size={large ? 40 : 28} style={{ color: 'rgba(229,194,137,0.68)' }} />
      </div>
      <div className="mt-5 h-3 overflow-hidden rounded-full bg-black/25">
        <div className="h-full rounded-full" style={{ width: `${percent}%`, background: 'linear-gradient(90deg, #8dbbcb, #e5c289)' }} />
      </div>
      {!live && <input className="mt-5 w-full" type="range" min="0" max={max} value={value} onChange={event => onManualChange(Number(event.target.value))} />}
    </div>
  )
}

function ExpeditionPanel({ resin }: { resin: ResinData | null }) {
  const current = resin?.currentExpeditionNum ?? 0
  const max = resin?.maxExpeditionNum ?? 5
  return (
    <div className="ui-sans">
      <div className="text-4xl" style={{ color: 'rgba(255,249,237,0.92)' }}>{current}/{max}</div>
      <div className="mt-1 text-xs" style={{ color: 'rgba(216,200,175,0.55)' }}>expeditions active</div>
      <div className="mt-5 grid grid-cols-5 gap-2">
        {Array.from({ length: max }).map((_, index) => (
          <div key={index} className="h-12 rounded-lg border" style={{ borderColor: index < current ? 'rgba(229,194,137,0.45)' : 'rgba(229,194,137,0.12)', background: index < current ? 'rgba(229,194,137,0.1)' : 'rgba(0,0,0,0.12)' }} />
        ))}
      </div>
    </div>
  )
}

function SpendIdeas({ resin }: { resin: number }) {
  const ideas = resin >= 120 ? ['Weekly bosses', 'Artifact domains', 'Talent books'] : resin >= 40 ? ['Condensed resin', 'Boss material', 'Ley line'] : ['Save for later', 'Do commissions', 'Explore route']
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {ideas.map((idea, index) => (
        <div key={idea} className="rounded-lg border p-4" style={{ borderColor: 'rgba(229,194,137,0.15)', background: index === 0 ? 'rgba(229,194,137,0.08)' : 'rgba(0,0,0,0.12)' }}>
          <Star size={20} style={{ color: 'rgba(229,194,137,0.82)' }} />
          <div className="mt-3 text-lg">{idea}</div>
          <div className="ui-sans mt-1 text-xs" style={{ color: 'rgba(216,200,175,0.52)' }}>suggested action</div>
        </div>
      ))}
    </div>
  )
}

function FallbackRoster() {
  return (
    <div className="ui-sans rounded-lg border p-6 text-sm" style={{ borderColor: 'rgba(229,194,137,0.15)', color: 'rgba(216,200,175,0.68)' }}>
      Character data could not be loaded yet. The board will populate automatically when Hoyolab allows the request.
    </div>
  )
}

function useLocalState<T>(key: string, fallback: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : fallback
    } catch {
      return fallback
    }
  })
  return [value, (next: T) => {
    setValue(next)
    localStorage.setItem(key, JSON.stringify(next))
  }]
}


