import { parseYouTubeVideoId } from './youtube-url'

describe('parseYouTubeVideoId', () => {
  it('從 youtube.com/watch?v= 網址取出 videoId', () => {
    expect(parseYouTubeVideoId('https://www.youtube.com/watch?v=SX_ViT4Ra7k')).toBe('SX_ViT4Ra7k')
  })

  it.each([
    ['youtu.be 短網址', 'https://youtu.be/SX_ViT4Ra7k'],
    ['YouTube Music', 'https://music.youtube.com/watch?v=SX_ViT4Ra7k'],
    ['Shorts', 'https://www.youtube.com/shorts/SX_ViT4Ra7k'],
    ['嵌入網址', 'https://www.youtube.com/embed/SX_ViT4Ra7k'],
    ['手機版網址', 'https://m.youtube.com/watch?v=SX_ViT4Ra7k'],
    ['省略通訊協定', 'youtube.com/watch?v=SX_ViT4Ra7k'],
    ['直接輸入 videoId', 'SX_ViT4Ra7k'],
    ['前後有空白', '  https://youtu.be/SX_ViT4Ra7k\n'],
  ])('支援%s', (_, input) => {
    expect(parseYouTubeVideoId(input)).toBe('SX_ViT4Ra7k')
  })

  it.each([
    ['t=', 'https://youtu.be/SX_ViT4Ra7k?t=42'],
    [
      'list=',
      'https://www.youtube.com/watch?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG&v=SX_ViT4Ra7k',
    ],
    ['多個參數', 'https://www.youtube.com/watch?v=SX_ViT4Ra7k&list=PL123&index=2&t=1m30s'],
  ])('忽略 %s 等其餘參數', (_, input) => {
    expect(parseYouTubeVideoId(input)).toBe('SX_ViT4Ra7k')
  })

  it.each([
    ['空字串', ''],
    ['非 YouTube 網址', 'https://vimeo.com/watch?v=SX_ViT4Ra7k'],
    ['videoId 長度不對', 'https://youtu.be/SX_ViT4Ra7'],
    ['videoId 含不允許的字元', 'https://www.youtube.com/watch?v=SX_ViT4Ra7!'],
    ['頻道網址', 'https://www.youtube.com/@kenshiyonezu'],
    ['一般文字', '米津玄師 Lemon'],
  ])('無法辨識%s時回傳 null', (_, input) => {
    expect(parseYouTubeVideoId(input)).toBeNull()
  })
})
