import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-play-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="placeholder">
      <h1>播放頁</h1>
      <p>歌曲：{{ songId() }}</p>
    </main>
  `,
})
export class PlayPage {
  readonly songId = input.required<string>();
}
