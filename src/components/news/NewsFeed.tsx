import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, Search, Sparkles, Video } from '../ui/Icons'
import { buildYouTubeEmbedUrl, youtubeEmbedModes, YouTubeEmbedMode } from '../../utils/youtube'

interface FeedArticle {
  id: string
  title: string
  link: string
  date: string
  category: 'News' | 'Update' | 'Event'
  summary: string
}

interface FeedVideo {
  id: string
  title: string
  link: string
  date: string
  thumbnail: string
  channel: string
}

const articleFeeds = [
  { category: 'News' as const, url: 'https://genshin-feed.com/feeds/en/rss/all.xml' },
  { category: 'Update' as const, url: 'https://genshin-feed.com/feeds/en/rss/updates.xml' },
  { category: 'Event' as const, url: 'https://genshin-feed.com/feeds/en/rss/events.xml' },
]

const officialVideoFeed = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCiS882YPwZt1NfaM0gR0D9Q'

const creatorVideoFeeds = [
  { channel: 'Zy0x', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UClYObD5y2ZSAcFhEtg_ATnw' },
  { channel: 'SevyPlays', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCbH9gOjlJHCrCjaz-mIvyYg' },
  { channel: 'Gacha Gamer', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC8BTtymnCZ7jTvt09cjPMwQ' },
  { channel: 'taka gg', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UC65Haje10c2f5zSQjeJXI2A' },
  { channel: 'Xlice', url: 'https://www.youtube.com/feeds/videos.xml?channel_id=UCzrJ_-d_n3LmpJNSYVxXsHQ' },
]

const creatorSpotlights = ['Zy0x', 'SevyPlays', 'Gacha Gamer', 'taka gg', 'Xlice']

const fallbackArticles: FeedArticle[] = [
  {
    id: 'fallback-version',
    title: 'Latest Version Updates',
    link: 'https://genshin.hoyoverse.com/en/news',
    date: new Date().toISOString(),
    category: 'Update',
    summary: 'Open the official news hub for fresh version notes, character previews, events, and notices.',
  },
  {
    id: 'fallback-events',
    title: 'Current Events',
    link: 'https://genshin.hoyoverse.com/en/news',
    date: new Date(Date.now() - 3600000).toISOString(),
    category: 'Event',
    summary: 'Check ongoing event posts and reward details from the official Genshin Impact news page.',
  },
]

const fallbackVideos: FeedVideo[] = [
  {
    id: 'HQuhLaFAsVU',
    title: 'Character Teaser - "Nicole: The Silenced Golden Strings"',
    link: 'https://www.youtube.com/watch?v=HQuhLaFAsVU',
    date: '2026-05-14T04:00:16+00:00',
    thumbnail: 'https://i1.ytimg.com/vi/HQuhLaFAsVU/hqdefault.jpg',
    channel: 'Genshin Impact',
  },
  {
    id: 'WuKMCKqobrU',
    title: 'Zy0x DESTROYS The New Imaginarium Theater While Going Slightly Insane... | Genshin Impact',
    link: 'https://www.youtube.com/watch?v=WuKMCKqobrU',
    date: '2026-05-12T00:59:24+00:00',
    thumbnail: 'https://i1.ytimg.com/vi/WuKMCKqobrU/hqdefault.jpg',
    channel: 'Zy0x',
  },
  {
    id: 'LEk0QXBU-G0',
    title: "WE'RE GOING BACK TO SUMERU !! | Genshin 6.6/Luna VII Livestream Reaction",
    link: 'https://www.youtube.com/watch?v=LEk0QXBU-G0',
    date: '2026-05-08T14:00:39+00:00',
    thumbnail: 'https://i1.ytimg.com/vi/LEk0QXBU-G0/hqdefault.jpg',
    channel: 'Zy0x',
  },
  {
    id: 'zER_yh9mbeU',
    title: 'EARLY ACCESS TO NICOLE CONFIRMS WHAT WE ALL SUSPECTED | C0 Nicole Build & Showcase (Genshin Impact)',
    link: 'https://www.youtube.com/watch?v=zER_yh9mbeU',
    date: '2026-05-15T04:01:04+00:00',
    thumbnail: 'https://i1.ytimg.com/vi/zER_yh9mbeU/hqdefault.jpg',
    channel: 'Gacha Gamer',
  },
  {
    id: 'J6YpT6gfXbo',
    title: 'MUALANI SUMMONS but everything goes wrong | Genshin Impact Summons',
    link: 'https://www.youtube.com/watch?v=J6YpT6gfXbo',
    date: '2024-08-31T00:33:44+00:00',
    thumbnail: 'https://i1.ytimg.com/vi/J6YpT6gfXbo/hqdefault.jpg',
    channel: 'Xlice',
  },
]

const trendSearches = [
  'zyox genshin impact',
  'sevyplays genshin impact',
  'gacha gamer genshin impact',
  'taka gg genshin impact',
  'xlice genshin impact',
  'genshin impact new update',
  'genshin impact version trailer',
  'genshin impact event guide',
  'genshin impact character demo',
  'genshin impact spiral abyss',
]

const quickRoutes = [
  { label: 'Official News', href: 'https://genshin.hoyoverse.com/en/news' },
  { label: 'Version Notes', href: 'https://genshin.hoyoverse.com/en/news?category=2' },
  { label: 'Current Events', href: 'https://genshin.hoyoverse.com/en/news?category=3' },
  { label: 'Creator Guides', href: 'https://www.youtube.com/results?search_query=genshin+impact+creator+guides' },
]

export function NewsFeed() {
  const [articles, setArticles] = useState<FeedArticle[]>([])
  const [videos, setVideos] = useState<FeedVideo[]>([])
  const [seed] = useState(() => Date.now())
  const [activeSearch, setActiveSearch] = useState(trendSearches[0])
  const [embedMode, setEmbedMode] = useState<YouTubeEmbedMode>('standard')

  useEffect(() => {
    let cancelled = false
    async function load() {
      const [nextArticles, nextVideos] = await Promise.all([
        loadArticles(),
        loadVideos(),
      ])
      if (cancelled) return
      setArticles(nextArticles.length ? nextArticles : fallbackArticles)
      setVideos(nextVideos.length ? nextVideos : fallbackVideos)
    }
    load()
    return () => { cancelled = true }
  }, [seed])

  const mixedArticles = useMemo(() => shuffleBySeed(articles, seed).slice(0, 9), [articles, seed])
  const hero = mixedArticles[0] || fallbackArticles[0]
  const sideArticles = mixedArticles.slice(1, 5)
  const storyCards = mixedArticles.slice(5)
  const featuredVideo = videos[0] || fallbackVideos[0]
  const otherVideos = videos.slice(1, 11)

  return (
    <main className="feed-page">
      <section className="feed-hero">
        <div className="feed-hero-copy">
          <div className="feed-kicker">
            <Sparkles size={15} />
            Live Teyvat Feed
          </div>
          <h1>News, updates, and videos in one place</h1>
          <p>Official posts are shuffled into a fresh dashboard, with Genshin video drops and fast YouTube searches for what people are watching now.</p>
        </div>
        <aside className="feed-hero-aside archive-card" aria-label="Creator spotlight">
          <div className="feed-section-title">
            <Video size={16} />
            Creator Watch
          </div>
          <div className="creator-watch-grid">
            {creatorSpotlights.map(creator => (
              <a
                key={creator}
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${creator} genshin impact`)}`}
                target="_blank"
                rel="noreferrer"
              >
                <span>{creator.slice(0, 2)}</span>
                <strong>{creator}</strong>
              </a>
            ))}
          </div>
          <a
            className="creator-watch-open"
            href="https://www.youtube.com/results?search_query=genshin+impact+creator+guides"
            target="_blank"
            rel="noreferrer"
          >
            Browse creator guides <ExternalLink size={13} />
          </a>
        </aside>
      </section>

      <section className="feed-layout">
        <motion.div
          className="feed-feature archive-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <FeedBadge label={hero.category} />
          <h2>{hero.title}</h2>
          <p>{hero.summary}</p>
          <div className="feed-meta">
            <span>{formatDate(hero.date)}</span>
            <a href={hero.link} target="_blank" rel="noreferrer">
              Open <ExternalLink size={13} />
            </a>
          </div>
        </motion.div>

        <div className="feed-stack">
          {sideArticles.map((article, index) => (
            <a className="feed-mini archive-card" href={article.link} target="_blank" rel="noreferrer" key={article.id}>
              <FeedBadge label={article.category} />
              <strong>{article.title}</strong>
              <span>{formatDate(article.date)}</span>
            </a>
          ))}
          {!sideArticles.length && <FeedSkeleton />}
          <div className="feed-shortcuts archive-card">
            <div className="feed-section-title">
              <Sparkles size={15} />
              Quick Routes
            </div>
            <div className="feed-shortcut-grid">
              {quickRoutes.map(route => (
                <a href={route.href} target="_blank" rel="noreferrer" key={route.label}>
                  <span>{route.label}</span>
                  <ExternalLink size={12} />
                </a>
              ))}
            </div>
          </div>
        </div>

        <section className="video-panel archive-card">
          <div className="feed-section-title">
            <Video size={16} />
            Creator & Official Videos
          </div>
          <VideoPreview video={featuredVideo} mode={embedMode} large />
          <EmbedModeButtons mode={embedMode} onChange={setEmbedMode} />
          <div className="video-strip">
            {otherVideos.map(video => <VideoPreview key={video.id} video={video} mode={embedMode} />)}
          </div>
        </section>

        <section className="trend-panel archive-card">
          <div className="feed-section-title">
            <Search size={16} />
            Trending Searches
          </div>
          <div className="trend-searches">
            {trendSearches.map(query => (
              <button
                key={query}
                className={activeSearch === query ? 'active' : ''}
                onClick={() => setActiveSearch(query)}
                type="button"
              >
                {query.replace('genshin impact ', '')}
              </button>
            ))}
          </div>
          <a
            className="trend-open"
            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(activeSearch)}`}
            target="_blank"
            rel="noreferrer"
          >
            Open YouTube results <ExternalLink size={14} />
          </a>
        </section>

        <section className="story-grid">
          {storyCards.map(article => (
            <a className="story-card archive-card" href={article.link} target="_blank" rel="noreferrer" key={article.id}>
              <FeedBadge label={article.category} />
              <h3>{article.title}</h3>
              <p>{article.summary}</p>
              <span>{formatDate(article.date)}</span>
            </a>
          ))}
        </section>
      </section>
    </main>
  )
}

function FeedBadge({ label }: { label: FeedArticle['category'] }) {
  return <span className={`feed-badge ${label.toLowerCase()}`}>{label}</span>
}

function EmbedModeButtons({ mode, onChange }: { mode: YouTubeEmbedMode; onChange: (mode: YouTubeEmbedMode) => void }) {
  return (
    <div className="youtube-mode-row feed-video-modes">
      {youtubeEmbedModes.map(option => (
        <button
          key={option.id}
          className={mode === option.id ? 'active' : ''}
          onClick={() => onChange(option.id)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function VideoPreview({ video, mode, large = false }: { video: FeedVideo; mode: YouTubeEmbedMode; large?: boolean }) {
  const embed = buildYouTubeEmbedUrl(video.id, '', mode)
  const canEmbed = Boolean(embed)

  return (
    <div className={large ? 'video-preview large' : 'video-preview'}>
      {canEmbed ? (
        <iframe
          key={embed}
          src={embed}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <a className="video-fallback" href={video.link} target="_blank" rel="noreferrer">
          <Video size={24} />
        </a>
      )}
      <a className="video-caption" href={video.link} target="_blank" rel="noreferrer">
        <strong>{video.title}</strong>
        <span>{video.channel} · {formatDate(video.date)}</span>
      </a>
    </div>
  )
}

function FeedSkeleton() {
  return (
    <>
      {[0, 1, 2].map(item => <div className="feed-mini archive-card shimmer-loading" key={item} />)}
    </>
  )
}

async function loadArticles(): Promise<FeedArticle[]> {
  const loaded = await Promise.all(articleFeeds.map(async feed => {
    const xml = await fetchText(feed.url)
    if (!xml) return []
    return parseRssItems(xml).map(item => ({
      ...item,
      id: `${feed.category}-${item.link || item.title}`,
      category: feed.category,
    }))
  }))

  const unique = new Map<string, FeedArticle>()
  loaded.flat().forEach(item => {
    if (!unique.has(item.link)) unique.set(item.link, item)
  })
  return [...unique.values()].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 24)
}

async function loadVideos(): Promise<FeedVideo[]> {
  const feeds = [
    { channel: 'Genshin Impact', url: officialVideoFeed },
    ...creatorVideoFeeds,
  ]
  const loaded = await Promise.all(feeds.map(feed => loadVideoFeed(feed.url, feed.channel)))
  const unique = new Map<string, FeedVideo>()
  loaded.flat().forEach(video => {
    if (!unique.has(video.id)) unique.set(video.id, video)
  })

  return [...unique.values()].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, 12)
}

async function loadVideoFeed(url: string, fallbackChannel: string): Promise<FeedVideo[]> {
  const xml = await fetchText(url)
  if (!xml) return []
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  return [...doc.querySelectorAll('entry')].map(entry => {
    const id = xmlText(entry, 'videoId')
    const link = entry.querySelector('link')?.getAttribute('href') || `https://www.youtube.com/watch?v=${id}`
    return {
      id,
      title: text(entry, 'title') || 'Genshin Impact video',
      link,
      date: text(entry, 'published') || new Date().toISOString(),
      thumbnail: entry.querySelector('thumbnail')?.getAttribute('url') || '',
      channel: text(entry, 'name') || fallbackChannel,
    }
  }).filter(video => video.id && isRegularYouTubeWatchUrl(video.link) && isGenshinVideo(video)).slice(0, 4)
}

async function fetchText(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    if (!response.ok) return ''
    return response.text()
  } catch {
    return ''
  }
}

function parseRssItems(xml: string): Omit<FeedArticle, 'id' | 'category'>[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  return [...doc.querySelectorAll('item')].slice(0, 14).map(item => ({
    title: text(item, 'title') || 'Genshin Impact update',
    link: text(item, 'link') || 'https://genshin.hoyoverse.com/en/news',
    date: text(item, 'pubDate') || new Date().toISOString(),
    summary: cleanSummary(text(item, 'description')),
  }))
}

function text(parent: Element, selector: string): string {
  return parent.querySelector(selector)?.textContent?.trim() || ''
}

function xmlText(parent: Element, localName: string): string {
  return [...parent.getElementsByTagName('*')]
    .find(element => element.localName === localName)
    ?.textContent
    ?.trim() || ''
}

function isRegularYouTubeWatchUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.hostname.includes('youtube.com') && url.pathname === '/watch' && Boolean(url.searchParams.get('v'))
  } catch {
    return false
  }
}

function isGenshinVideo(video: FeedVideo): boolean {
  const value = `${video.title} ${video.channel}`.toLowerCase()
  return [
    'genshin',
    'teyvat',
    'natlan',
    'sumeru',
    'fontaine',
    'inazuma',
    'liyue',
    'mondstadt',
    'spiral abyss',
    'imaginarium theater',
    'archon',
  ].some(term => value.includes(term))
}

function cleanSummary(value: string): string {
  const doc = new DOMParser().parseFromString(value || '', 'text/html')
  const clean = (doc.body.textContent || value || '').replace(/\s+/g, ' ').trim()
  return clean.length > 180 ? `${clean.slice(0, 177)}...` : clean
}

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Fresh'
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function shuffleBySeed<T>(items: T[], seed: number): T[] {
  let state = seed % 2147483647
  const next = () => {
    state = (state * 16807) % 2147483647
    return (state - 1) / 2147483646
  }
  return [...items].sort(() => next() - 0.5)
}
