# 只使用 YouTube IFrame Player API 與 oEmbed，不使用 Data API

播放、取得目前時間與跳轉只需 IFrame Player API，影片標題由 `youtube.com/oembed` 取得（已確認會回傳 CORS 標頭，可由瀏覽器直接呼叫），縮圖網址由 `i.ytimg.com/vi/{videoId}/mqdefault.jpg` 直接組出。兩者皆不需 API Key。Data API v3 需要 API Key，而純前端（見 [0001](./0001-pure-frontend-no-backend.md)）會讓 Key 公開暴露並受配額限制，因此不使用；代價是沒有站內搜尋與相關影片，使用者必須自行貼上 YouTube 網址

## Consequences

- 影片是否允許嵌入無法事先得知，只能在播放時由錯誤碼 100、101、150 判斷
- YouTube 規範要求嵌入的播放器必須可見且不小於 200×200，因此不能做成隱藏影片、只聽音樂的模式
