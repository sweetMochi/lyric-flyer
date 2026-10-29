import { LibraryStore } from './library-store'
import { FolderNode } from './library-tree'

/** 存在記憶體中的 LibraryStore，供測試使用 */
export class MemoryLibraryStore implements LibraryStore {
  private treeJson: string | null

  /** 設為 true 時，之後的寫入都會因容量不足而失敗 */
  quotaExceeded = false

  constructor(initialTree?: FolderNode) {
    this.treeJson = initialTree ? JSON.stringify(initialTree) : null
  }

  loadTree(): FolderNode | null {
    return this.treeJson === null ? null : JSON.parse(this.treeJson)
  }

  saveTree(tree: FolderNode): void {
    if (this.quotaExceeded) {
      throw new DOMException('記憶體版 LibraryStore 容量不足', 'QuotaExceededError')
    }
    this.treeJson = JSON.stringify(tree)
  }
}
