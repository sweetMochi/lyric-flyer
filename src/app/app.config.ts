import { registerLocaleData } from '@angular/common'
import localeZhHant from '@angular/common/locales/zh-Hant'
import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core'
import { provideRouter, withComponentInputBinding, withHashLocation } from '@angular/router'
import { routes } from './app.routes'

registerLocaleData(localeZhHant)

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation(), withComponentInputBinding()),
    { provide: LOCALE_ID, useValue: 'zh-Hant' },
  ],
}
