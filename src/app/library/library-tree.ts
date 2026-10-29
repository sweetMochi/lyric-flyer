/** 根資料夾的 id 固定，其餘節點 id 以 crypto.randomUUID() 產生（ADR 0005） */
export const ROOT_FOLDER_ID = 'root'

export interface FolderNode {
  id: string
  type: 'folder'
  name: string
  children: LibraryNode[]
}

export interface SongNode {
  id: string
  type: 'song'
  videoId: string
  name: string
  ytTitle?: string
  unavailable?: boolean
}

export type LibraryNode = FolderNode | SongNode

export function createEmptyTree(): FolderNode {
  return { id: ROOT_FOLDER_ID, type: 'folder', name: '', children: [] }
}
