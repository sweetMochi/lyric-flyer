import { registerLocaleData } from '@angular/common'
import localeZhHant from '@angular/common/locales/zh-Hant'
import {
  ApplicationConfig,
  inject,
  LOCALE_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core'
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router'
import { routes } from './app.routes'
import { LibraryService } from './library/library-service'

registerLocaleData(localeZhHant)

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation(), withComponentInputBinding()),
    { provide: LOCALE_ID, useValue: 'zh-Hant' },
    provideAppInitializer(() => {
      // 啟動時即載入歌曲庫，讓 LibraryStore 檢查本機儲存的 schemaVersion
      inject(LibraryService)
      // 請瀏覽器不要在空間不足時自動清除本機資料，結果不影響後續流程
      navigator.storage?.persist?.().catch(() => undefined)
    }),
  ],
}
