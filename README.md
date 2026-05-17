# Teyvat Archive — A Genshin Impact Bookmark Manager

> *"I got tired of my browser looking like every other boring productivity tool, so I built something that actually makes me want to open a new tab."*

This is a Chrome/Brave extension that replaces your default bookmark manager with something that feels like it shipped inside Genshin Impact itself. Warm parchment, gold borders, regional themes, a full OST music player, wallpaper gallery, and HoYoLab data sync — all packed into a Manifest V3 extension.

It's not a theme pack or a skin. It's a fully functional bookmark manager that happens to look like an in-game menu.

---

## What's Actually In Here

### Bookmarks That Don't Suck

You save links the normal way — right-click a page, hit "Save to Teyvat Archive," pick a folder, done. But the cards that come back look like item descriptions from an RPG. Favicon, title, URL, visit count, favorite/pin toggles. Hover on a card and it lifts with a gold glow. It's the kind of thing you'd expect from a $20 Notion template, except it's free and lives in your browser.

Folders, tags, favorites, pinned items, recently visited — all the organizational stuff you'd expect, just dressed up like you're managing an adventurer's inventory instead of a Chrome bookmarks bar.

### Regional Themes — Six of Them

Every Genshin region has its own theme. Switch between them from the corner menu and the entire UI transforms:

- **Mondstadt** — teal and silver, wind-swept elegance
- **Liyue** — red and gold, warm like a lantern-lit harbor
- **Inazuma** — purple and dark blue, thunderous and mysterious
- **Sumeru** — green and gold, rainforest meets desert
- **Fontaine** — blue and silver, refined and aquatic
- **Nodkrai** — ice blue and frost, cold northern beauty

Each theme changes the color palette, glow effects, border tones, and background gradients. It's not just a color swap — the whole atmosphere shifts.

### Music Player — 780 Tracks, Zero Setup

This was probably the most fun part to build. The extension ships with **780 official Genshin Impact OST tracks** organized by region. When you switch themes, the music automatically starts playing tracks from that region.

The player lives in the bottom dock — it's collapsed by default, but hover over it and it expands with playback controls, a loop button, and a track picker that lets you browse the entire library. Everything plays from local `.webm` files, so there's no buffering and no internet required.

| Region | Tracks | Size |
|--------|--------|------|
| Mondstadt | 52 | ~130 MB |
| Liyue | 130 | ~320 MB |
| Inazuma | 130 | ~310 MB |
| Sumeru | 130 | ~280 MB |
| Fontaine | 130 | ~250 MB |
| Nodkrai | 108 | ~140 MB |

### Wallpaper Gallery

22 handpicked PC-ratio wallpapers (calendars, event art, character showcases) bundled with the extension. Open the gallery from the floating button in the bottom-right corner, click one, and it becomes your background.

There's a trash button on each wallpaper — tap it to hide that wallpaper from the gallery without deleting the file. Hit "Restore" to bring them all back. Upload your own custom wallpapers too.

When a wallpaper is active, the whole UI adapts: a dark overlay keeps text readable, cards get deeper backgrounds, and text gets a shadow so nothing disappears into bright areas.

### HoYoLab Data Sync

Connect your HoYoLab account and the extension pulls your actual in-game data — characters, resin status, exploration stats, daily commissions — and displays them as widgets on the home page. It's the kind of thing that makes the extension feel alive instead of just being a pretty bookmark manager.

Supports both v1 and v2 authentication tokens. There's also a "Detect from Browser" button that auto-fills your credentials if you're already logged into HoYoLab in the same browser.

### Browser History

The "Recent" tab in the dock shows your actual Chrome browsing history, filtered and displayed in the same warm card style. It's not bookmarks — it's real history, pulled via the `chrome.history` API.

### Search

`Ctrl+K` opens a search overlay that fuzzy-searches across all your bookmarks — titles, URLs, folder names. Results appear instantly with visit counts and domain hints. It's fast enough that you forget you're using a Chrome extension and not a native app.

---

## How to Install

### From Source

```bash
git clone https://github.com/NumberOneMahiruSimp/genshin-bookmarks.git
cd genshin-bookmarks
npm install
npm run build
```

Then:

1. Open Chrome or Brave and go to `chrome://extensions`
2. Turn on **Developer mode** (top-right toggle)
3. Click **Load unpacked**
4. Select the `dist/` folder
5. Done. Open a new tab and it's there.

### Keyboard Shortcuts

| Shortcut | What It Does |
|----------|-------------|
| `Ctrl+Shift+S` | Open the archive |
| `Ctrl+Shift+B` | Quick-save current page |
| `Ctrl+Shift+A` | Open dashboard in a new tab |
| `Ctrl+K` | Search overlay |
| `Esc` | Close anything open |

---

## What I Built This With

- **React 18** + **TypeScript** — because I wanted type safety and didn't want to debug undefined errors at 2 AM
- **TailwindCSS 3** — utility classes that actually make sense
- **Framer Motion** — spring physics animations that feel good, not like a PowerPoint transition
- **IndexedDB** (via `idb`) — everything works offline, no server needed
- **Fuse.js** — fuzzy search that doesn't misspell your own bookmarks
- **Vite** — builds in under 10 seconds, not 3 minutes
- **Chrome Extension Manifest V3** — the current standard, not the deprecated one

The music and wallpapers are stored in `public/` and get bundled into the build. The music alone is about 1.4 GB, so the `.gitignore` excludes those directories. There are download scripts in `scripts/` if you want to pull them fresh.

---

## The Design Philosophy

I didn't want this to look like a SaaS dashboard that someone slapped a Genshin wallpaper on. Every component was built to feel like it belongs in the game's UI:

- Cards have warm parchment gradients with gold top-edge highlights
- Borders use double-line decorative styling
- Text uses Cormorant Garamond for titles (the closest Google Font to Genshin's serif) and Inter for body text
- The bottom dock is a full-width floating glass bar, not a sidebar
- Animations are restrained — 200-300ms hovers, slow fades, spring physics. Nothing bounces or spins unless it's supposed to
- The background has a subtle paper texture generated entirely from CSS gradients
- No particles unless you want them. No glow unless it's earned

The goal was simple: if HoYoverse made a productivity tool, this is what it would look like.

---

## What's Not Here (Yet)

- Custom widget builder — the home page widgets are hardcoded for now
- Cloud sync between devices — everything lives in IndexedDB locally
- Mobile support — this is built for desktop browsers, period
- PNG icons for Chrome Web Store submission — the current icons are SVG
- Import/export bookmarks as HTML — coming eventually

---

## License

MIT. Do whatever you want with it. If you fork it and make it better, I'd love to see it.
