import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  signal,
} from '@angular/core'
import { IframePlayer, loadYouTubeIframeApi } from './youtube-iframe-api'

/** 以 IFrame Player API 嵌入的播放器，使用內建控制列，元件銷毀時即停止播放 */
@Component({
  selector: 'app-youtube-player',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (loadFailed()) {
      <p class="error">無法載入 YouTube 播放器，請確認網路連線後重試</p>
    }
  `,
  styles: `
    // YouTube 規範要求播放器可見且不小於 200×200（ADR 0002）
    :host {
      position: relative;
      display: block;
      width: 100%;
      min-width: 200px;
      min-height: 200px;
      aspect-ratio: 16 / 9;
      background: #000;
    }

    :host ::ng-deep iframe {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      border: 0;
    }

    .error {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      margin: 0;
      padding: 1rem;
      color: var(--color-text-muted);
      text-align: center;
    }
  `,
})
export class YouTubePlayer {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef)

  readonly videoId = input.required<string>()

  protected readonly loadFailed = signal(false)

  constructor() {
    afterRenderEffect((onCleanup) => {
      const videoId = this.videoId()
      // IFrame API 會以 iframe 取代傳入的元素，因此另建一個元素交給它
      const target = document.createElement('div')
      this.host.nativeElement.appendChild(target)

      let player: IframePlayer | undefined
      let destroyed = false
      this.loadFailed.set(false)
      loadYouTubeIframeApi().then(
        (YT) => {
          if (!destroyed) {
            player = new YT.Player(target, {
              videoId,
              width: '100%',
              height: '100%',
              playerVars: { playsinline: 1, rel: 0 },
            })
          }
        },
        () => this.loadFailed.set(true),
      )

      onCleanup(() => {
        destroyed = true
        player?.destroy()
        target.remove()
      })
    })
  }
}
