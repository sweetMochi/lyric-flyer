import { Dialog } from '@angular/cdk/dialog'
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { LibraryService } from '../library/library-service'
import { ROOT_FOLDER_ID, SongNode } from '../library/library-tree'
import { videoThumbnailUrl } from '../library/youtube-url'
import { AddSongDialog, AddSongDialogData } from './add-song-dialog'

@Component({
  selector: 'app-library-manager-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <main class="page">
      <header class="toolbar">
        <h1>{{ title() }}</h1>
        <button type="button" class="button" (click)="openAddSongDialog()">＋ 新增歌曲</button>
      </header>

      @if (library.isEmpty()) {
        <section class="empty">
          <p>歌曲庫還沒有任何歌曲</p>
          <div class="empty-actions">
            <button type="button" class="button primary" (click)="openAddSongDialog()">
              新增歌曲
            </button>
            <!-- 歌曲庫檔匯入完成前先停用 -->
            <button type="button" class="button" disabled>匯入歌曲庫檔</button>
          </div>
        </section>
      } @else if (folder()?.children?.length === 0) {
        <p class="empty">此資料夾沒有內容</p>
      } @else {
        <ul class="list">
          @for (node of folder()?.children; track node.id) {
            <li>
              @if (node.type === 'song') {
                <a class="row" [routerLink]="['/play', node.id]">
                  <img
                    class="thumbnail"
                    [src]="thumbnailUrl(node)"
                    alt=""
                    width="96"
                    height="54"
                    loading="lazy"
                  />
                  <span class="name">{{ node.name }}</span>
                </a>
              } @else {
                <a class="row" [routerLink]="['/library', node.id]">
                  <span class="folder-icon" aria-hidden="true">📁</span>
                  <span class="name">{{ node.name }}</span>
                </a>
              }
            </li>
          }
        </ul>
      }
    </main>
  `,
  styles: `
    .page {
      max-width: 60rem;
      margin: 0 auto;
      padding: 1rem;
    }

    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1rem;

      h1 {
        margin: 0;
        font-size: 1.5rem;
      }
    }

    .empty {
      padding: 3rem 1rem;
      color: var(--color-text-muted);
      text-align: center;

      p {
        margin: 0 0 1rem;
      }
    }

    .empty-actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.75rem;
    }

    .list {
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      border-radius: 0.5rem;
      color: inherit;
      text-decoration: none;

      &:hover {
        background: var(--color-surface);
      }
    }

    .thumbnail,
    .folder-icon {
      flex: none;
      width: 96px;
      height: 54px;
      border-radius: 0.25rem;
      background: var(--color-surface-raised);
    }

    .thumbnail {
      object-fit: cover;
    }

    .folder-icon {
      display: grid;
      place-items: center;
      font-size: 1.5rem;
    }

    .name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `,
})
export class LibraryManagerPage {
  protected readonly library = inject(LibraryService)
  private readonly dialog = inject(Dialog)

  readonly folderId = input.required<string>()

  protected readonly folder = computed(() => this.library.getFolder(this.folderId()))
  protected readonly title = computed(() =>
    this.folderId() === ROOT_FOLDER_ID ? '歌曲庫' : (this.folder()?.name ?? ''),
  )

  protected openAddSongDialog(): void {
    this.dialog.open<SongNode, AddSongDialogData>(AddSongDialog, {
      data: { folderId: this.folderId() },
      panelClass: 'dialog-panel',
      ariaLabelledBy: 'add-song-dialog-title',
    })
  }

  protected thumbnailUrl(song: SongNode): string {
    return videoThumbnailUrl(song.videoId)
  }
}
