import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog'
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core'
import { RouterLink } from '@angular/router'
import { LibraryService, SongLocation } from '../library/library-service'
import { ROOT_FOLDER_ID, SongNode } from '../library/library-tree'
import { parseYouTubeVideoId } from '../library/youtube-url'

export interface AddSongDialogData {
  folderId: string
}

@Component({
  selector: 'app-add-song-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <form class="dialog" (submit)="$event.preventDefault(); submit()">
      <h2 id="add-song-dialog-title">新增歌曲</h2>

      <label for="add-song-url">YouTube 網址</label>
      <input
        id="add-song-url"
        type="text"
        inputmode="url"
        autocomplete="off"
        placeholder="https://www.youtube.com/watch?v=…"
        [value]="url()"
        (input)="url.set($any($event.target).value)"
        [attr.aria-invalid]="showUrlError()"
        [attr.aria-describedby]="showUrlError() ? 'add-song-url-error' : null"
      />
      @if (showUrlError()) {
        <p id="add-song-url-error" class="error">無法辨識的 YouTube 網址</p>
      }

      @for (location of duplicates(); track location.song.id) {
        <p class="hint">
          此影片也存在於『<a [routerLink]="['/library', folderIdOf(location)]" (click)="close()">{{
            pathOf(location)
          }}</a
          >』
        </p>
      }

      @if (error(); as error) {
        <p class="error" role="alert">{{ error }}</p>
      }

      <div class="actions">
        <button type="button" class="button" (click)="close()">取消</button>
        <button type="submit" class="button primary" [disabled]="!videoId() || saving()">
          {{ saving() ? '新增中…' : '新增' }}
        </button>
      </div>
    </form>
  `,
  styles: `
    .dialog {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 1.25rem;
      border-radius: 0.75rem;
      background: var(--color-surface);
      color: var(--color-text);
    }

    h2 {
      margin: 0 0 0.5rem;
      font-size: 1.25rem;
    }

    input {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--color-border);
      border-radius: 0.375rem;
      background: var(--color-bg);
      color: inherit;
      font: inherit;
    }

    p {
      margin: 0;
      font-size: 0.875rem;
    }

    .error {
      color: var(--color-danger);
    }

    .hint {
      color: var(--color-text-muted);
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }
  `,
})
export class AddSongDialog {
  private readonly library = inject(LibraryService)
  private readonly dialogRef = inject<DialogRef<SongNode>>(DialogRef)
  private readonly data = inject<AddSongDialogData>(DIALOG_DATA)

  protected readonly url = signal('')
  protected readonly saving = signal(false)
  protected readonly error = signal<string | null>(null)

  protected readonly videoId = computed(() => parseYouTubeVideoId(this.url()))
  protected readonly showUrlError = computed(() => this.url().trim() !== '' && !this.videoId())
  protected readonly duplicates = computed(() => {
    const videoId = this.videoId()
    return videoId ? this.library.findSongsByVideoId(videoId) : []
  })

  protected async submit(): Promise<void> {
    const videoId = this.videoId()
    if (!videoId || this.saving()) {
      return
    }

    this.saving.set(true)
    this.error.set(null)
    try {
      const result = await this.library.addSong(this.data.folderId, videoId)
      if (result.status === 'added') {
        this.dialogRef.close(result.song)
      } else {
        this.error.set('儲存空間不足，無法新增歌曲，請先匯出歌曲庫檔備份')
      }
    } catch (error) {
      console.error(error)
      this.error.set('新增歌曲時發生錯誤，請重試')
    } finally {
      this.saving.set(false)
    }
  }

  protected close(): void {
    this.dialogRef.close()
  }

  protected folderIdOf(location: SongLocation): string {
    return location.folders.at(-1)?.id ?? ROOT_FOLDER_ID
  }

  /** 「資料夾路徑 / 歌曲名稱」，根資料夾不列入路徑 */
  protected pathOf(location: SongLocation): string {
    return [...location.folders.slice(1).map((folder) => folder.name), location.song.name].join(
      ' / ',
    )
  }
}
