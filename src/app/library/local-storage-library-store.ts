import { LibraryStore } from './library-store'
import { FolderNode } from './library-tree'

const metaKey = 'lf:meta'
const treeKey = 'lf:tree'

/** 目前本機儲存結構的版本，結構變更時遞增並在 checkSchemaVersion 中遷移 */
const currentSchemaVersion = 1

interface Meta {
  schemaVersion: number
}

/** 以 localStorage 實作的 LibraryStore（ADR 0006） */
export class LocalStorageLibraryStore implements LibraryStore {
  constructor(private readonly storage: Storage) {
    this.checkSchemaVersion()
  }

  loadTree(): FolderNode | null {
    const json = this.storage.getItem(treeKey)
    return json === null ? null : JSON.parse(json)
  }

  saveTree(tree: FolderNode): void {
    this.storage.setItem(treeKey, JSON.stringify(tree))
  }

  private checkSchemaVersion(): void {
    const json = this.storage.getItem(metaKey)
    if (json === null) {
      const meta: Meta = { schemaVersion: currentSchemaVersion }
      this.storage.setItem(metaKey, JSON.stringify(meta))
      return
    }

    const meta: Meta = JSON.parse(json)
    if (meta.schemaVersion > currentSchemaVersion) {
      // 由較新版本的 APP 寫入，無法安全讀寫，避免覆蓋使用者資料
      throw new Error(
        `本機歌曲庫的資料版本（${meta.schemaVersion}）比目前 APP 支援的版本（${currentSchemaVersion}）新`,
      )
    }
  }
}
