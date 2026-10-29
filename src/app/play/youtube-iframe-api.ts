/** YouTube IFrame Player API 中本專案用到的部分（ADR 0002） */
export interface IframePlayer {
  destroy(): void
}

export interface IframePlayerOptions {
  videoId: string
  width?: string | number
  height?: string | number
  playerVars?: {
    playsinline?: 0 | 1
    rel?: 0 | 1
  }
}

export interface YouTubeIframeApi {
  Player: new (element: HTMLElement, options: IframePlayerOptions) => IframePlayer
}

declare global {
  interface Window {
    YT?: YouTubeIframeApi
    onYouTubeIframeAPIReady?: () => void
  }
}

const scriptUrl = 'https://www.youtube.com/iframe_api'

let loading: Promise<YouTubeIframeApi> | undefined

/** 載入 IFrame Player API，整個 APP 只會插入一次 script */
export function loadYouTubeIframeApi(): Promise<YouTubeIframeApi> {
  loading ??= new Promise<YouTubeIframeApi>((resolve, reject) => {
    if (window.YT?.Player) {
      resolve(window.YT)
      return
    }

    window.onYouTubeIframeAPIReady = () => resolve(window.YT as YouTubeIframeApi)
    const script = document.createElement('script')
    script.src = scriptUrl
    script.async = true
    script.onerror = () => {
      // 允許之後重試，例如離線恢復後再進入播放頁
      loading = undefined
      script.remove()
      reject(new Error('無法載入 YouTube 播放器'))
    }
    document.head.appendChild(script)
  })
  return loading
}
