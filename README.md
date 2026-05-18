# Teyvat Archive

Teyvat Archive is a Genshin-inspired Chrome and Brave extension for bookmarks, quick links, wallpapers, music, HoYoLab widgets, news, and official video browsing.

It is built to feel like an in-game archive instead of a plain browser page: regional themes, warm cards, smooth motion, a bottom dock, cursor sparkles, and a video feed that opens official Genshin content in a polished panel.

## Install From GitHub

You can use the extension without building anything.

1. Download this repository as a ZIP from GitHub.
2. Unzip it.
3. Open `chrome://extensions` in Chrome or Brave.
4. Turn on **Developer mode**.
5. Click **Load unpacked**.
6. Select the `extension/` folder inside the unzipped project.

Do not select the repo root. The browser needs the `extension/` folder because it contains the built files and `manifest.json`.

## Developer Setup

```bash
git clone https://github.com/NumberOneMahiruSimp/genshin-bookmarks.git
cd genshin-bookmarks
npm install
npm run package
```

Then load the generated `extension/` folder from `chrome://extensions`.

For local UI work, run:

```bash
npm run dev
```

The localhost preview is only for development. To test the real Chrome extension behavior, always load `extension/` in `chrome://extensions`.

## What Works

- New tab dashboard with Genshin-inspired regional themes.
- Bookmark cards with folders, tags, favorites, pinned items, and visit counts.
- Quick-save context menu.
- Chrome history view.
- Fuzzy search with `Ctrl+K`.
- Wallpaper gallery — click the wallpaper button to open `wallpapers.html` in a new tab with a full gallery view, search, opacity controls, and custom wallpaper upload.
- Local music player support.
- HoYoLab widget support.
- Official news and update feed.
- Official YouTube video panel with embed fallback handling.
- Cursor sparkle effect.

## Wallpaper Gallery

The wallpaper button in the dock opens `wallpapers.html` in a new browser tab. This is a standalone React page bundled alongside the extension — it is not a React modal.

- Browse all built-in wallpapers with a search filter.
- Adjust wallpaper opacity with a slider.
- Upload custom wallpapers (stored in `chrome.storage.local`).
- Changes apply immediately to the extension's background.

The wallpaper list comes from `wallpapers/manifest.json` inside the extension folder. Custom uploads and opacity are persisted across sessions.

## About YouTube Videos

The extension can support YouTube embeds, but YouTube still controls whether each individual video is allowed to play inside an extension iframe.

This project now:

- Converts normal YouTube links, `youtu.be` links, embed links, and Shorts links into proper embed URLs.
- Uses Chrome extension permissions for YouTube iframe and API requests.
- Adds extension header rules to make YouTube embeds behave better inside the extension page.
- Filters the official feed to normal watch videos where possible.
- Keeps a direct YouTube fallback link when YouTube refuses an embed.

If a video says `This video is unavailable` or shows an error like `152`, that usually means YouTube blocked that specific video from being embedded in the extension context. It is not caused by the extension cookies. Try the Standard, Privacy, or Plain mode buttons, or open the video directly on YouTube.

## Scripts

```bash
npm run dev       # Vite localhost preview
npm run lint      # TypeScript check
npm run build     # Build to dist/
npm run package   # Build and copy dist/ to extension/
```

## Notes For Maintainers

The committed `extension/` folder is intentional. It lets someone download the repo ZIP from GitHub and load the extension immediately without Node.js.

When code changes, run `npm run package` before committing so `extension/` stays in sync with the source.

Large music and wallpaper assets may be managed separately depending on repo size. The extension still works without them, but the full media experience needs those files in `public/` before packaging.

## License

MIT.
