import { InjectionToken } from '@angular/core'
import { LocalStorageLibraryStore } from './local-storage-library-store'
import { FolderNode } from './library-tree'

/**
 * 歌曲庫的儲存介面，所有讀寫都經由此處（ADR 0006）
 *
 * 寫入超出容量時，實作應拋出名稱為 `QuotaExceededError` 的錯誤
 */
export interface LibraryStore {
  /** 讀取書籤樹，尚未儲存過時回傳 null */
  loadTree(): FolderNode | null
  saveTree(tree: FolderNode): void
}

export const LIBRARY_STORE = new InjectionToken<LibraryStore>('LIBRARY_STORE', {
  providedIn: 'root',
  factory: () => new LocalStorageLibraryStore(localStorage),
})
