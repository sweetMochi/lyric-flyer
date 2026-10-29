import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { NoticeService } from './notice-service'

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  template: `
    <router-outlet />
    <div class="notice" role="status" aria-live="polite">
      @if (notice.message(); as message) {
        <p>{{ message }}</p>
      }
    </div>
  `,
  styles: `
    .notice {
      position: fixed;
      inset-inline: 0;
      bottom: 1.5rem;
      display: flex;
      justify-content: center;
      padding-inline: 1rem;
      pointer-events: none;

      p {
        margin: 0;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        background: var(--color-surface-raised);
        box-shadow: 0 4px 16px rgb(0 0 0 / 50%);
      }
    }
  `,
})
export class App {
  protected readonly notice = inject(NoticeService)
}
