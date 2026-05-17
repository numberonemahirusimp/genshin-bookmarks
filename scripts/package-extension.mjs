import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(root, 'dist')
const extensionDir = join(root, 'extension')

if (!existsSync(distDir)) {
  throw new Error('dist/ does not exist. Run npm run build before packaging the extension.')
}

rmSync(extensionDir, { recursive: true, force: true })
mkdirSync(extensionDir, { recursive: true })
cpSync(distDir, extensionDir, { recursive: true })

writeFileSync(
  join(extensionDir, 'README.txt'),
  [
    'Teyvat Archive ready-to-load extension folder',
    '',
    'Chrome or Brave:',
    '1. Open chrome://extensions',
    '2. Turn on Developer mode',
    '3. Click Load unpacked',
    '4. Select this extension folder',
    '',
    'Do not select the repository root. Select this folder.',
    '',
  ].join('\n'),
)

console.log('Packaged extension/ from dist/. Load extension/ with chrome://extensions.')
