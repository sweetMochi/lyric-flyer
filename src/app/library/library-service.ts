import { computed, inject, Injectable, signal } from '@angular/core'
import { LIBRARY_STORE } from './library-store'
import { createEmptyTree, FolderNode, LibraryNode, SongNode } from './library-tree'
import { FETCH_VIDEO_TITLE } from './video-title'

export type AddSongResult =
  | { status: 'added'; song: SongNode }
  /** 儲存空間不足，歌曲庫維持原狀，應提示使用者匯出歌曲庫檔 */
  | { status: 'quota-exceeded' }

/** 歌曲與其所在的資料夾路徑 */
export interface SongLocation {
  song: SongNode
  /** 從根資料夾到歌曲所在資料夾（含）的路徑 */
  folders: FolderNode[]
}

@Injectable({ providedIn: 'root' })
export class LibraryService {
  private readonly store = inject(LIBRARY_STORE)
  private readonly fetchVideoTitle = inject(FETCH_VIDEO_TITLE)
  private readonly tree = signal<FolderNode>(this.store.loadTree() ?? createEmptyTree())

  readonly isEmpty = computed(() => this.tree().children.length === 0)

  getFolder(id: string): FolderNode | undefined {
    const node = findNode(this.tree(), id)
    return node?.type === 'folder' ? node : undefined
  }

  findSong(id: string): SongLocation | undefined {
    for (const location of songLocations(this.tree(), [])) {
      if (location.song.id === id) {
        return location
      }
    }
    return undefined
  }

  /** 依書籤樹的順序列出使用同一支影片的所有歌曲（ADR 0005） */
  findSongsByVideoId(videoId: string): SongLocation[] {
    return [...songLocations(this.tree(), [])].filter(({ song }) => song.videoId === videoId)
  }

  /** 在資料夾末端新增歌曲，並以 oEmbed 取得影片標題作為歌曲名稱的預設值 */
  async addSong(folderId: string, videoId: string): Promise<AddSongResult> {
    if (!this.getFolder(folderId)) {
      throw new Error(`找不到資料夾 ${folderId}`)
    }

    // 取得影片標題失敗不阻擋新增
    const ytTitle = await this.fetchVideoTitle(videoId).catch(() => undefined)
    const song: SongNode = {
      id: crypto.randomUUID(),
      type: 'song',
      videoId,
      name: ytTitle ?? videoId,
      ...(ytTitle === undefined ? {} : { ytTitle }),
    }

    if (!this.commit(appendChild(this.tree(), folderId, song))) {
      return { status: 'quota-exceeded' }
    }
    return { status: 'added', song }
  }

  /** 先寫入 LibraryStore，成功後才更新畫面上的樹，容量不足時回傳 false */
  private commit(tree: FolderNode): boolean {
    try {
      this.store.saveTree(tree)
    } catch (error) {
      if (isQuotaExceededError(error)) {
        return false
      }
      throw error
    }
    this.tree.set(tree)
    return true
  }
}

function isQuotaExceededError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    // 舊版 Firefox 使用 NS_ERROR_DOM_QUOTA_REACHED
    (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  )
}

/** 回傳在指定資料夾末端加入節點後的新樹，不修改原本的樹 */
function appendChild(folder: FolderNode, folderId: string, node: LibraryNode): FolderNode {
  if (folder.id === folderId) {
    return { ...folder, children: [...folder.children, node] }
  }
  return {
    ...folder,
    children: folder.children.map((child) =>
      child.type === 'folder' ? appendChild(child, folderId, node) : child,
    ),
  }
}

function* songLocations(folder: FolderNode, parents: FolderNode[]): Generator<SongLocation> {
  const folders = [...parents, folder]
  for (const child of folder.children) {
    if (child.type === 'song') {
      yield { song: child, folders }
    } else {
      yield* songLocations(child, folders)
    }
  }
}

function findNode(node: LibraryNode, id: string): LibraryNode | undefined {
  if (node.id === id) {
    return node
  }
  if (node.type === 'folder') {
    for (const child of node.children) {
      const found = findNode(child, id)
      if (found) {
        return found
      }
    }
  }
  return undefined
}
