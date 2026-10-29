const videoIdPattern = /^[A-Za-z0-9_-]{11}$/

/** 從 YouTube 網址或 11 碼 videoId 取出 videoId，忽略其餘參數，無法辨識時回傳 null */
export function parseYouTubeVideoId(input: string): string | null {
  const text = input.trim()
  if (videoIdPattern.test(text)) {
    return text
  }

  let url: URL
  try {
    url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`)
  } catch {
    return null
  }

  const host = url.hostname.replace(/^(www|m)\./, '')
  const [, first, second] = url.pathname.split('/')
  let candidate: string | null | undefined
  if (host === 'youtu.be') {
    candidate = first
  } else if (host === 'youtube.com' || host === 'music.youtube.com') {
    if (first === 'watch') {
      candidate = url.searchParams.get('v')
    } else if (first === 'shorts' || first === 'embed') {
      candidate = second
    }
  }

  return candidate && videoIdPattern.test(candidate) ? candidate : null
}

/** 影片縮圖網址（ADR 0002） */
export function videoThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`
}
