import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { appConfig } from './app.config';
import { LibraryManagerPage } from './library-manager/library-manager-page';
import { PlayPage } from './play/play-page';

describe('路由', () => {
  let harness: RouterTestingHarness;

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: appConfig.providers });
    harness = await RouterTestingHarness.create();
  });

  it('首頁導向根資料夾的書籤管理員', async () => {
    const page = await harness.navigateByUrl('/', LibraryManagerPage);

    expect(TestBed.inject(Router).url).toBe('/library/root');
    expect(page.folderId()).toBe('root');
  });

  it('資料夾路由進入書籤管理員並帶入資料夾 id', async () => {
    const page = await harness.navigateByUrl('/library/f-123', LibraryManagerPage);

    expect(page.folderId()).toBe('f-123');
  });

  it('歌曲路由進入播放頁並帶入歌曲 id', async () => {
    const page = await harness.navigateByUrl('/play/s-456', PlayPage);

    expect(page.songId()).toBe('s-456');
  });
});
