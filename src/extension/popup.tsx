import { useState, useEffect, useRef } from 'react'
import { Bookmark, Folder } from '../types'
import { db } from '../store'
import { Globe, ExternalLink, Sparkles, BookmarkPlus, Archive, FolderIcon, Plus, X } from '../components/ui/Icons'

export function PopupApp() {
  const [tabInfo, setTabInfo] = useState<{ title: string; url: string; favicon: string } | null>(null)
  const [folders, setFolders] = useState<Folder[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [recent, setRecent] = useState<Bookmark[]>([])
  const [creating, setCreating] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function init() {
      const allFolders = await db.getAllFolders()
      setFolders(allFolders)
      if (allFolders.length > 0) setSelectedFolder(allFolders[0].id)
      const all = await db.getAllBookmarks()
      setRecent(all.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5))
      // Auto-load current tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      const tab = tabs[0]
      if (tab?.url) setTabInfo({ title: tab.title || 'Untitled', url: tab.url, favicon: tab.favIconUrl || '' })
    }
    init()
  }, [])

  useEffect(() => { if (creating) setTimeout(() => inputRef.current?.focus(), 50) }, [creating])

  async function handleSave() {
    if (!tabInfo) return
    try {
      await db.addBookmark({
        id: `bm-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: tabInfo.title, url: tabInfo.url, description: '',
        favicon: tabInfo.favicon, thumbnail: '', folderId: selectedFolder,
        tags: [], isFavorite: false, isPinned: false, visitCount: 1,
        createdAt: Date.now(), updatedAt: Date.now(), lastVisitedAt: Date.now(),
      })
      setSaved(true)
      setTimeout(() => window.close(), 1200)
    } catch (err) { console.error('Save failed:', err) }
  }

  async function createFolder() {
    const name = newFolderName.trim()
    if (!name) return
    const id = `folder-${Date.now()}`
    const folder: Folder = { id, name, icon: 'Folder', color: '#d4a35a', parentId: null, order: folders.length, createdAt: Date.now() }
    await db.addFolder(folder)
    setFolders(prev => [...prev, folder])
    setSelectedFolder(id)
    setNewFolderName('')
    setCreating(false)
  }

  function openDashboard() { chrome.tabs.create({ url: chrome.runtime.getURL('index.html') }) }

  const s: React.CSSProperties = {
    fontFamily: "'Inter', sans-serif",
    width: 380,
    minHeight: 400,
    maxHeight: 600,
    overflowY: 'auto',
    overflowX: 'hidden',
    background: '#0c0f18',
  }

  const row: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px',
    borderBottom: '1px solid rgba(212,163,90,0.08)',
  }

  return (
    <div style={s}>
      <div style={row}>
        <div style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid rgba(212,163,90,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(212,163,90,0.05)' }}>
          <Sparkles size={14} style={{ color: 'rgba(242,229,204,0.6)' }} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 300, color: 'rgba(242,229,204,0.7)' }}>Teyvat Archive</div>
          <div style={{ fontSize: 9, fontWeight: 300, color: 'rgba(141,150,171,0.4)' }}>Quick Save</div>
        </div>
        <button onClick={openDashboard}
          style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', borderRadius: 8, fontSize: 9, fontWeight: 300, border: '1px solid rgba(212,163,90,0.1)', color: 'rgba(141,150,171,0.5)', background: 'none', cursor: 'pointer' }}>
          <Archive size={11} /> Open
        </button>
      </div>

      <div style={{ padding: 16 }}>
        {saved ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, border: '1px solid rgba(212,163,90,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, background: 'rgba(212,163,90,0.05)' }}>
              <BookmarkPlus size={20} style={{ color: 'rgba(212,163,90,0.5)' }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 300, color: 'rgba(242,229,204,0.7)' }}>Archived</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Tab preview */}
            {tabInfo && (
              <div style={{ padding: 12, borderRadius: 10, background: 'rgba(20,24,37,0.4)', border: '1px solid rgba(212,163,90,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(212,163,90,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(0,0,0,0.2)' }}>
                    {tabInfo.favicon ? <img src={tabInfo.favicon} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} />
                      : <Globe size={14} style={{ color: 'rgba(212,163,90,0.3)' }} />}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 300, color: 'rgba(255,255,255,0.55)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tabInfo.title}</div>
                    <div style={{ fontSize: 9, fontWeight: 300, marginTop: 1, color: 'rgba(141,150,171,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tabInfo.url}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Folder selector + create */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontSize: 9, fontWeight: 300, letterSpacing: '0.05em', color: 'rgba(141,150,171,0.4)' }}>CATEGORY</div>
                {!creating && (
                  <button onClick={() => setCreating(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(212,163,90,0.3)', fontSize: 9, padding: 0 }}>
                    <Plus size={10} /> New
                  </button>
                )}
              </div>
              {creating ? (
                <div style={{ display: 'flex', gap: 6 }}>
                  <input ref={inputRef} value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
                    placeholder="Folder name"
                    onKeyDown={e => { if (e.key === 'Enter') createFolder() }}
                    style={{ flex: 1, padding: '7px 10px', borderRadius: 8, fontSize: 11, fontWeight: 300, border: '1px solid rgba(212,163,90,0.12)', background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.6)', outline: 'none' }} />
                  <button onClick={createFolder}
                    style={{ padding: '7px 12px', borderRadius: 8, fontSize: 10, fontWeight: 300, border: '1px solid rgba(212,163,90,0.12)', background: 'rgba(212,163,90,0.06)', color: 'rgba(242,229,204,0.5)', cursor: 'pointer' }}>
                    Add
                  </button>
                  <button onClick={() => { setCreating(false); setNewFolderName('') }}
                    style={{ padding: '7px', borderRadius: 8, border: '1px solid rgba(141,150,171,0.08)', background: 'none', color: 'rgba(141,150,171,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {folders.map(f => {
                    const isSelected = selectedFolder === f.id
                    return (
                      <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <button onClick={() => setSelectedFolder(f.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 5, padding: '6px 10px', borderRadius: 7, fontSize: 10, fontWeight: 300,
                            border: isSelected ? '1px solid rgba(212,163,90,0.18)' : '1px solid rgba(212,163,90,0.05)',
                            background: isSelected ? 'rgba(212,163,90,0.06)' : 'transparent',
                            color: isSelected ? 'rgba(242,229,204,0.5)' : 'rgba(141,150,171,0.35)',
                            cursor: 'pointer', transition: 'all 0.15s',
                          }}>
                          <FolderIcon size={10} style={{ color: f.color }} />
                          {f.name}
                        </button>
                        {isSelected && (
                          <button onClick={async () => {
                            await db.deleteFolder(f.id)
                            setFolders(prev => prev.filter(x => x.id !== f.id))
                            setSelectedFolder(folders.find(x => x.id !== f.id)?.id || null)
                          }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 6, border: 'none', background: 'rgba(248,113,113,0.06)', color: 'rgba(248,113,113,0.35)', cursor: 'pointer', fontSize: 9 }}
                            onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.12)'}
                            onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.06)'}
                            title="Delete category">
                            <X size={10} />
                          </button>
                        )}
                      </div>
                    )
                  })}
                  {folders.length === 0 && !creating && (
                    <div style={{ fontSize: 10, fontWeight: 300, color: 'rgba(141,150,171,0.2)', padding: '6px 0' }}>No categories yet</div>
                  )}
                </div>
              )}
            </div>

            {/* Save button */}
            <button onClick={handleSave} disabled={!tabInfo}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 10, fontSize: 12, fontWeight: 300,
                border: '1px solid rgba(212,163,90,0.15)', background: 'rgba(212,163,90,0.08)',
                color: !tabInfo ? 'rgba(141,150,171,0.2)' : 'rgba(242,229,204,0.6)',
                cursor: !tabInfo ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, opacity: !tabInfo ? 0.4 : 1,
              }}>
              <BookmarkPlus size={14} /> Save to Archive
            </button>

            {/* Recent */}
            {recent.length > 0 && (
              <>
                <div style={{ fontSize: 9, fontWeight: 300, letterSpacing: '0.05em', color: 'rgba(141,150,171,0.3)', marginTop: 4 }}>RECENT</div>
                {recent.slice(0, 3).map(bm => (
                  <button key={bm.id} onClick={() => window.open(bm.url, '_blank')}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 8, background: 'none', border: 'none', cursor: 'pointer' }}
                    onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.015)'}
                    onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.background = 'none'}
                  >
                    <div style={{ width: 24, height: 24, borderRadius: 6, border: '1px solid rgba(212,163,90,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(0,0,0,0.15)' }}>
                      {bm.favicon ? <img src={bm.favicon} alt="" style={{ width: 14, height: 14, objectFit: 'contain' }} />
                        : <Globe size={10} style={{ color: 'rgba(212,163,90,0.2)' }} />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                      <div style={{ fontSize: 10, fontWeight: 300, color: 'rgba(255,255,255,0.4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{bm.title}</div>
                    </div>
                    <ExternalLink size={9} style={{ color: 'rgba(141,150,171,0.2)' }} />
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
