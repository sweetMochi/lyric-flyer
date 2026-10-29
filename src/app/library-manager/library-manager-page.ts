import { ChangeDetectionStrategy, Component, input } from '@angular/core'

@Component({
  selector: 'app-library-manager-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="placeholder">
      <h1>書籤管理員</h1>
      <p>資料夾：{{ folderId() }}</p>
    </main>
  `,
})
export class LibraryManagerPage {
  readonly folderId = input.required<string>()
}
