import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { LibraryService } from '../library/library-service'
import { YouTubePlayer } from './youtube-player'

@Component({
  selector: 'app-play-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, YouTubePlayer],
  template: `
    @if (location(); as location) {
      <header class="title-bar">
        <a class="back" [routerLink]="['/library', folderId()]" aria-label="返回資料夾">←</a>
        <h1>{{ location.song.name }}</h1>
      </header>

      <main class="content">
        <app-youtube-player class="player" [videoId]="location.song.videoId" />
        <section class="lyrics">
          <p class="no-lyrics">尚無歌詞，可匯入</p>
        </section>
      </main>
    }
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100%;
    }

    .title-bar {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-bottom: 1px solid var(--color-border);

      h1 {
        overflow: hidden;
        margin: 0;
        font-size: 1.125rem;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .back {
      display: grid;
      flex: none;
      place-items: center;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      color: inherit;
      font-size: 1.25rem;
      text-decoration: none;

      &:hover {
        background: var(--color-surface-raised);
      }
    }

    .content {
      display: flex;
      flex: 1;
      flex-direction: column;
    }

    .lyrics {
      flex: 1;
      padding: 1rem;
    }

    .no-lyrics {
      margin: 2rem 0;
      color: var(--color-text-muted);
      text-align: center;
    }

    // 桌機：影片在左、歌詞在右
    @media (min-width: 900px) {
      .content {
        flex-direction: row;
        align-items: flex-start;
        gap: 1.5rem;
        padding: 1.5rem;
      }

      .player {
        flex: 3;
      }

      .lyrics {
        flex: 2;
        padding: 0;
      }
    }
  `,
})
export class PlayPage {
  private readonly library = inject(LibraryService)

  readonly songId = input.required<string>()

  protected readonly location = computed(() => this.library.findSong(this.songId()))
  protected readonly folderId = computed(() => this.location()?.folders.at(-1)?.id)
}
