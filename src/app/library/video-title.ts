import { InjectionToken } from '@angular/core'

/** 取得影片標題，任何失敗（離線、影片不存在、私人影片等）都回傳 undefined */
export type FetchVideoTitle = (videoId: string) => Promise<string | undefined>

export const FETCH_VIDEO_TITLE = new InjectionToken<FetchVideoTitle>('FETCH_VIDEO_TITLE', {
  providedIn: 'root',
  factory: () => fetchVideoTitleFromOEmbed,
})

const timeoutMs = 8000

/** 以 oEmbed 取得影片標題，不需 API Key（ADR 0002） */
async function fetchVideoTitleFromOEmbed(videoId: string): Promise<string | undefined> {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
  const url = `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(videoUrl)}`
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) })
    if (!response.ok) {
      return undefined
    }
    const body: { title?: unknown } = await response.json()
    return typeof body.title === 'string' && body.title !== '' ? body.title : undefined
  } catch {
    return undefined
  }
}
