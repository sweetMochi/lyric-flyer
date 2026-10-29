import { Routes } from '@angular/router';

const rootFolderUrl = 'library/root';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: rootFolderUrl },
  {
    path: 'library/:folderId',
    title: '書籤管理員｜Lyric Flyer',
    loadComponent: () =>
      import('./library-manager/library-manager-page').then((m) => m.LibraryManagerPage),
  },
  {
    path: 'play/:songId',
    title: '播放頁｜Lyric Flyer',
    loadComponent: () => import('./play/play-page').then((m) => m.PlayPage),
  },
  { path: '**', redirectTo: rootFolderUrl },
];
