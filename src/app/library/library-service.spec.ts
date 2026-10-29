import { TestBed } from '@angular/core/testing'
import { LIBRARY_STORE } from './library-store'
import { LibraryService } from './library-service'
import { FolderNode, SongNode } from './library-tree'
import { MemoryLibraryStore } from './memory-library-store'
import { FETCH_VIDEO_TITLE } from './video-title'

describe('LibraryService', () => {
  let store: MemoryLibraryStore
  let fetchVideoTitle: (videoId: string) => Promise<string | undefined>

  beforeEach(() => {
    store = new MemoryLibraryStore()
    fetchVideoTitle = async () => undefined
  })

  /** 每次呼叫都建立新的服務實例，模擬重新整理頁面 */
  function createService(): LibraryService {
    TestBed.resetTestingModule()
    TestBed.configureTestingModule({
      providers: [
        { provide: LIBRARY_STORE, useValue: store },
        { provide: FETCH_VIDEO_TITLE, useValue: (videoId: string) => fetchVideoTitle(videoId) },
      ],
    })
    return TestBed.inject(LibraryService)
  }

  it('新的歌曲庫只有空的根資料夾', () => {
    const library = createService()

    expect(library.isEmpty()).toBe(true)
    expect(library.getFolder('root')?.children).toEqual([])
  })

  describe('新增歌曲', () => {
    it('在指定資料夾新增歌曲，名稱預設為影片標題，重新整理後仍在', async () => {
      fetchVideoTitle = async (videoId) =>
        videoId === 'SX_ViT4Ra7k' ? '米津玄師 MV「Lemon」' : undefined
      const library = createService()

      const result = await library.addSong('root', 'SX_ViT4Ra7k')

      expect(result.status).toBe('added')
      const reloaded = createService()
      expect(reloaded.isEmpty()).toBe(false)
      expect(reloaded.getFolder('root')?.children).toEqual([
        {
          id: expect.stringMatching(
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
          ),
          type: 'song',
          videoId: 'SX_ViT4Ra7k',
          name: '米津玄師 MV「Lemon」',
          ytTitle: '米津玄師 MV「Lemon」',
        },
      ])
    })

    it.each([
      ['取不到影片標題', async () => undefined],
      ['取得影片標題時發生錯誤', () => Promise.reject(new TypeError('Failed to fetch'))],
    ])('%s時仍新增歌曲，名稱暫用 videoId', async (_, failingFetch) => {
      fetchVideoTitle = failingFetch
      const library = createService()

      const result = await library.addSong('root', 'SX_ViT4Ra7k')

      expect(result.status).toBe('added')
      const [song] = library.getFolder('root')?.children ?? []
      expect(song).toEqual({
        id: expect.any(String),
        type: 'song',
        videoId: 'SX_ViT4Ra7k',
        name: 'SX_ViT4Ra7k',
      })
    })

    it('儲存空間不足時回報容量不足，歌曲庫維持原狀', async () => {
      const library = createService()
      store.quotaExceeded = true

      const result = await library.addSong('root', 'SX_ViT4Ra7k')

      expect(result.status).toBe('quota-exceeded')
      expect(library.isEmpty()).toBe(true)
      expect(createService().isEmpty()).toBe(true)
    })

    it('寫入發生容量不足以外的錯誤時照常拋出', async () => {
      const library = createService()
      vi.spyOn(store, 'saveTree').mockImplementation(() => {
        throw new SyntaxError('壞掉的資料')
      })

      await expect(library.addSong('root', 'SX_ViT4Ra7k')).rejects.toThrow('壞掉的資料')
      expect(library.isEmpty()).toBe(true)
    })

    it('資料夾不存在時拋出錯誤', async () => {
      const library = createService()

      await expect(library.addSong('no-such-folder', 'SX_ViT4Ra7k')).rejects.toThrow()
      expect(library.isEmpty()).toBe(true)
    })
  })

  describe('查詢歌曲', () => {
    const lemon: SongNode = { id: 's-lemon', type: 'song', videoId: 'SX_ViT4Ra7k', name: 'Lemon' }
    const lemonLive: SongNode = {
      id: 's-lemon-live',
      type: 'song',
      videoId: 'SX_ViT4Ra7k',
      name: 'Lemon（Live）',
    }
    const other: SongNode = { id: 's-other', type: 'song', videoId: 'dQw4w9WgXcQ', name: '其他' }
    const anime: FolderNode = { id: 'f-anime', type: 'folder', name: '動畫', children: [lemonLive] }
    const japanese: FolderNode = {
      id: 'f-ja',
      type: 'folder',
      name: '日文',
      children: [anime, lemon],
    }
    const root: FolderNode = { id: 'root', type: 'folder', name: '', children: [japanese, other] }

    beforeEach(() => {
      store = new MemoryLibraryStore(root)
    })

    it('依 id 找到歌曲與其所在的資料夾路徑', () => {
      const library = createService()

      expect(library.findSong('s-lemon-live')).toEqual({
        song: lemonLive,
        folders: [root, japanese, anime],
      })
      expect(library.findSong('s-other')?.folders).toEqual([root])
    })

    it.each([
      ['不存在的 id', 'no-such-song'],
      ['資料夾的 id', 'f-ja'],
    ])('%s找不到歌曲', (_, id) => {
      expect(createService().findSong(id)).toBeUndefined()
    })

    it('列出使用同一支影片的所有歌曲', () => {
      const library = createService()

      expect(library.findSongsByVideoId('SX_ViT4Ra7k')).toEqual([
        { song: lemonLive, folders: [root, japanese, anime] },
        { song: lemon, folders: [root, japanese] },
      ])
      expect(library.findSongsByVideoId('aaaaaaaaaaa')).toEqual([])
    })
  })
})
