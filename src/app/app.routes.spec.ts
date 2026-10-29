import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { appConfig } from './app.config'
import { LibraryManagerPage } from './library-manager/library-manager-page'
import { LIBRARY_STORE } from './library/library-store'
import { MemoryLibraryStore } from './library/memory-library-store'
import { NoticeService } from './notice-service'
import { PlayPage } from './play/play-page'

describe('路由', () => {
  let harness: RouterTestingHarness

  beforeEach(async () => {
    const store = new MemoryLibraryStore({
      id: 'root',
      type: 'folder',
      name: '',
      children: [
        { id: 'f-123', type: 'folder', name: '日文', children: [] },
        { id: 's-456', type: 'song', videoId: 'SX_ViT4Ra7k', name: 'Lemon' },
      ],
    })
    TestBed.configureTestingModule({
      providers: [...appConfig.providers, { provide: LIBRARY_STORE, useValue: store }],
    })
    harness = await RouterTestingHarness.create()
  })

  it('首頁導向根資料夾的書籤管理員', async () => {
    const page = await harness.navigateByUrl('/', LibraryManagerPage)

    expect(TestBed.inject(Router).url).toBe('/library/root')
    expect(page.folderId()).toBe('root')
  })

  it('資料夾路由進入書籤管理員並帶入資料夾 id', async () => {
    const page = await harness.navigateByUrl('/library/f-123', LibraryManagerPage)

    expect(page.folderId()).toBe('f-123')
  })

  it('歌曲路由進入播放頁並帶入歌曲 id', async () => {
    const page = await harness.navigateByUrl('/play/s-456', PlayPage)

    expect(page.songId()).toBe('s-456')
  })

  it.each([
    ['資料夾', '/library/no-such-folder'],
    ['歌曲', '/play/no-such-song'],
    ['把歌曲當成資料夾', '/library/s-456'],
  ])('%s不存在時導回根資料夾並提示', async (_, url) => {
    await harness.navigateByUrl(url, LibraryManagerPage)

    expect(TestBed.inject(Router).url).toBe('/library/root')
    expect(TestBed.inject(NoticeService).message()).toBe('找不到該資料夾或歌曲')
  })
})
