# 🌟 Teyvat Archive — Bookmark Manager

> *"Navigate the web like exploring Teyvat."*

A premium browser-based Bookmark Manager extension for **Google Chrome** and **Brave Browser**, inspired heavily by the visual identity, UI philosophy, animations, typography, and atmosphere of **Genshin Impact**.

## ✨ Features

### 🏛️ Archive System
- **Bookmark Categories** — Organize links into themed collections (Adventure Log, Teyvat Atlas, etc.)
- **Folder System** — Nested folder architecture with visual hierarchy
- **Tags** — Color-coded labels for quick filtering
- **Smart Collections** — Favorites, Pinned, Recently Visited views

### 🎴 Visual Bookmark Cards
- Favicon & metadata display with RPG-style framing
- Animated hover reveals with glow and depth
- Corner ornamentation on every card

### 🔍 Search System
- **Fuzzy search** across titles, descriptions, and URLs
- Animated modal overlay with keyboard shortcuts (`Ctrl+K`)
- Filter by tags and folders

### 📊 Dashboard
- Recently added items
- Favorites gallery
- Most visited rankings
- Pinned collections overview
- Statistics counters

### 🎨 Theme Engine — 5 Genshin Regions
| Theme | Region | Vibe |
|-------|--------|------|
| 🌿 Mondstadt | City of Freedom | Teal, silver, cream — breezy elegance |
| 🏮 Liyue | Port of Contracts | Red, gold, parchment — prosperous warmth |
| ⚡ Inazuma | Eternity's Island | Purple, dark blue, gold — thunderous mystique |
| 🌴 Sumeru | City of Wisdom | Green, gold, cream — scholarly serenity |
| 💧 Fontaine | Court of Justice | Blue, silver, white — refined justice |

### ✨ Animations
- Smooth menu transitions with spring physics
- Floating particle background (canvas-based)
- Hover glows on every interactive element
- RPG-style panel switching
- Loading screen with spinning compass motif

### 🧩 Extension Features
- **One-click save** via context menu
- **Popup quick-save** with folder selection
- **Keyboard shortcuts**: `Ctrl+Shift+S` (open), `Ctrl+Shift+B` (save), `Ctrl+Shift+A` (dashboard)
- Manifest V3 compliant

### ♿ Accessibility
- Keyboard navigable
- Screen reader friendly
- High contrast mode support

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```

### Loading into Chrome/Brave

1. Run `npm run build` to generate the `dist/` folder
2. Open **Chrome** or **Brave** and navigate to `chrome://extensions`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked** and select the `dist/` folder
5. The extension is now installed!

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+S` | Open Teyvat Archive |
| `Ctrl+Shift+B` | Quick save current page |
| `Ctrl+Shift+A` | Open Dashboard (new tab) |
| `Ctrl+K` | Toggle search overlay |
| `Esc` | Close search / modals |

## 🏗️ Architecture

```
src/
├── components/
│   ├── ui/              # Reusable fantasy system (Panel, Button, Particles, Badge)
│   ├── layout/          # Sidebar, Header, MainLayout
│   ├── bookmarks/       # BookmarkCard, BookmarkGrid
│   ├── dashboard/       # Dashboard overview
│   ├── search/          # Search overlay (Fuse.js powered)
│   └── themes/          # ThemeSwitcher component
├── hooks/               # useTheme, useBookmarks
├── store/               # IndexedDB abstraction (idb)
├── themes/              # Theme configurations (5 regions)
├── types/               # TypeScript interfaces
├── utils/               # Sample data, helpers
└── extension/           # Background, content script, popup
```

### Design System

The UI uses **glassmorphism** with layered translucent panels, gold ornamental borders, and region-specific color palettes. Every component follows Genshin's design language:

- **Layered glass panels** with backdrop blur
- **Gold accents** on borders, text, and interactive elements
- **Corner ornaments** on panels and cards
- **Gradient backgrounds** per region theme
- **Subtle particle effects** in the background
- **Smooth transitions** with Framer Motion spring physics

## 🛠️ Tech Stack

- **React 18** + **TypeScript**
- **TailwindCSS** — utility-first styling
- **Framer Motion** — animations & transitions
- **IndexedDB** (via `idb`) — offline-first storage
- **Fuse.js** — fuzzy search
- **Vite** — build system
- **Lucide React** — icon system
- **Chrome Extension Manifest V3**

## 🎯 Design Philosophy

> *"Official HoYoverse productivity tool" quality.*

- **No generic SaaS appearance** — every element feels handcrafted
- **No plain cards** — ornamentation and depth on every surface
- **Immersive atmosphere** — the UI should feel like an RPG menu
- **Satisfying interactions** — micro-animations and hover states
- **Magical & alive** — floating particles, glow pulses, smooth transitions

## 📜 License

MIT
