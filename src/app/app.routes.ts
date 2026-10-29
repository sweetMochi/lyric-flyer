import { inject } from '@angular/core'
import { CanActivateFn, Router, Routes } from '@angular/router'
import { LibraryService } from './library/library-service'
import { ROOT_FOLDER_ID } from './library/library-tree'
import { NoticeService } from './notice-service'

const rootFolderUrl = `library/${ROOT_FOLDER_ID}`

/** 路由中的 id 不存在時導回根資料夾並提示 */
function redirectToRootFolder() {
  inject(NoticeService).show('找不到該資料夾或歌曲')
  return inject(Router).parseUrl(`/${rootFolderUrl}`)
}

const folderExists: CanActivateFn = (route) =>
  inject(LibraryService).getFolder(route.paramMap.get('folderId') ?? '')
    ? true
    : redirectToRootFolder()

const songExists: CanActivateFn = (route) =>
  inject(LibraryService).findSong(route.paramMap.get('songId') ?? '')
    ? true
    : redirectToRootFolder()

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: rootFolderUrl },
  {
    path: 'library/:folderId',
    title: '書籤管理員 | Lyric Flyer',
    canActivate: [folderExists],
    loadComponent: () =>
      import('./library-manager/library-manager-page').then((m) => m.LibraryManagerPage),
  },
  {
    path: 'play/:songId',
    title: '播放頁 | Lyric Flyer',
    canActivate: [songExists],
    loadComponent: () => import('./play/play-page').then((m) => m.PlayPage),
  },
  { path: '**', redirectTo: rootFolderUrl },
]
