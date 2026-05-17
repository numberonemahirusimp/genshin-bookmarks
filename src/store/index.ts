import { openDB, IDBPDatabase } from 'idb'
import { Bookmark, Folder, Tag, AppState, ThemeId } from '../types'

const DB_NAME = 'teyvat-archive'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase> | null = null

function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('bookmarks')) {
          const bookmarksStore = db.createObjectStore('bookmarks', { keyPath: 'id' })
          bookmarksStore.createIndex('folderId', 'folderId')
          bookmarksStore.createIndex('isFavorite', 'isFavorite')
          bookmarksStore.createIndex('isPinned', 'isPinned')
          bookmarksStore.createIndex('createdAt', 'createdAt')
          bookmarksStore.createIndex('visitCount', 'visitCount')
        }
        if (!db.objectStoreNames.contains('folders')) {
          const foldersStore = db.createObjectStore('folders', { keyPath: 'id' })
          foldersStore.createIndex('parentId', 'parentId')
          foldersStore.createIndex('order', 'order')
        }
        if (!db.objectStoreNames.contains('tags')) {
          db.createObjectStore('tags', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings')
        }
      },
    })
  }
  return dbPromise
}

export const db = {
  async getAllBookmarks(): Promise<Bookmark[]> {
    const db = await getDb()
    return db.getAll('bookmarks')
  },
  async getBookmark(id: string): Promise<Bookmark | undefined> {
    const db = await getDb()
    return db.get('bookmarks', id)
  },
  async addBookmark(bookmark: Bookmark): Promise<void> {
    const d = await getDb()
    await d.put('bookmarks', bookmark)
  },
  async updateBookmark(bookmark: Bookmark): Promise<void> {
    const db = await getDb()
    await db.put('bookmarks', bookmark)
  },
  async deleteBookmark(id: string): Promise<void> {
    const db = await getDb()
    await db.delete('bookmarks', id)
  },
  async getBookmarksByFolder(folderId: string): Promise<Bookmark[]> {
    const db = await getDb()
    return db.getAllFromIndex('bookmarks', 'folderId', folderId)
  },
  async getFavoriteBookmarks(): Promise<Bookmark[]> {
    const db = await getDb()
    const all = await db.getAll('bookmarks')
    return all.filter(b => b.isFavorite)
  },
  async getPinnedBookmarks(): Promise<Bookmark[]> {
    const db = await getDb()
    const all = await db.getAll('bookmarks')
    return all.filter(b => b.isPinned)
  },

  async getAllFolders(): Promise<Folder[]> {
    const db = await getDb()
    return db.getAll('folders')
  },
  async addFolder(folder: Folder): Promise<void> {
    const db = await getDb()
    await db.add('folders', folder)
  },
  async updateFolder(folder: Folder): Promise<void> {
    const db = await getDb()
    await db.put('folders', folder)
  },
  async deleteFolder(id: string): Promise<void> {
    const db = await getDb()
    await db.delete('folders', id)
  },

  async getAllTags(): Promise<Tag[]> {
    const db = await getDb()
    return db.getAll('tags')
  },
  async addTag(tag: Tag): Promise<void> {
    const db = await getDb()
    await db.add('tags', tag)
  },
  async updateTag(tag: Tag): Promise<void> {
    const db = await getDb()
    await db.put('tags', tag)
  },
  async deleteTag(id: string): Promise<void> {
    const db = await getDb()
    await db.delete('tags', id)
  },

  async getSetting(key: string): Promise<any> {
    const db = await getDb()
    return db.get('settings', key)
  },
  async setSetting(key: string, value: any): Promise<void> {
    const db = await getDb()
    await db.put('settings', value, key)
  },
}
