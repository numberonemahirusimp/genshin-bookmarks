import { execSync } from 'child_process'
import { copyFileSync, mkdirSync, existsSync, renameSync, rmSync } from 'fs'
import { join, resolve } from 'path'

const root = resolve(import.meta.dirname)
const musicSrc = join(root, 'public', 'music')
const musicTemp = join(root, '_music_temp')
const musicDist = join(root, 'dist', 'music')
const wallpapersSrc = join(root, 'public', 'wallpapers')
const wallpapersDist = join(root, 'dist', 'wallpapers')

// Step 1: Move music out of public temporarily
if (existsSync(musicSrc)) {
  console.log('⏳ Moving music out of public/ (will copy after build)...')
  renameSync(musicSrc, musicTemp)
}

// Step 2: Build (fast — no 1.4 GB music copy)
console.log('🔨 Building extension...')
try {
  execSync('tsc && vite build', { cwd: root, stdio: 'inherit' })
} catch (e) {
  // Restore music even if build fails
  if (existsSync(musicTemp)) renameSync(musicTemp, musicSrc)
  process.exit(1)
}

// Step 3: Move music back to public
if (existsSync(musicTemp)) {
  console.log('📦 Restoring music to public/...')
  renameSync(musicTemp, musicSrc)
}

// Step 4: Copy music to dist using robocopy (fast, no Vite overhead)
if (existsSync(musicSrc)) {
  console.log('📦 Copying music to dist/ (this takes a moment)...')
  try { execSync(`robocopy "${musicSrc}" "${musicDist}" /E /NFL /NDL /NJH /NJS /NC /NS /NP`, { cwd: root, stdio: 'inherit' }) } catch { /* robocopy exit 1 = success */ }
}

// Step 5: Copy wallpapers to dist
if (existsSync(wallpapersSrc)) {
  console.log('🖼️  Copying wallpapers to dist/...')
  try { execSync(`robocopy "${wallpapersSrc}" "${wallpapersDist}" /E /NFL /NDL /NJH /NJS /NC /NS /NP`, { cwd: root, stdio: 'inherit' }) } catch {}
}

console.log('✅ Build complete!')
