# 第一、二階段使用 localStorage，並以 LibraryStore 介面隔離

一般會預期以 IndexedDB 儲存這類資料，但第一、二階段刻意先用 localStorage：同步 API 實作最簡單，且每首歌詞約 5 至 10KB，約 5MB 的容量足以存放數百首歌曲。所有讀寫都透過 `LibraryStore` 介面，第三階段改為 IndexedDB 時只需替換實作，不影響其他模組

key 配置為 `lf:tree`（書籤樹）、`lf:lyrics:<songId>`（每首歌詞各一個 key）、`lf:settings`（顯示開關與單曲循環）。寫入時必須捕捉 `QuotaExceededError` 並提示使用者匯出歌曲庫檔

## Considered Options

- **File System Access API 直接讀寫本機資料夾**：Android 版 Chrome 不支援，與 PWA 的定位衝突
