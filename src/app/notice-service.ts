import { DestroyRef, inject, Injectable, signal } from '@angular/core'

const displayMs = 4000

/** 畫面底部短暫顯示的提示訊息 */
@Injectable({ providedIn: 'root' })
export class NoticeService {
  private timer: ReturnType<typeof setTimeout> | undefined

  readonly message = signal<string | null>(null)

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer))
  }

  show(message: string): void {
    clearTimeout(this.timer)
    this.message.set(message)
    this.timer = setTimeout(() => this.message.set(null), displayMs)
  }
}
