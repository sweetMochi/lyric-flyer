# 歌詞檔採自訂 JSON，並以 Zod 作為格式的唯一來源

歌詞需要承載振假名、羅馬拼音、翻譯與時間差，標準 LRC 無法表達。我們選擇自訂 JSON 格式，而非「擴充 LRC 純文字」：JSON 結構明確、易於驗證與版本遷移，且有 `format` 與 `version` 欄位可辨識檔案種類。LRC 只作為匯入來源，由專用的 LRC 匯入器轉換，不會匯出成 LRC

格式以 Zod v4 定義，同一份定義產生 TypeScript 型別、執行期驗證，以及建置時以 `z.toJSONSchema()` 輸出到 `public/schemas/` 的 JSON Schema，讓使用者在 VS Code 手寫歌詞檔時有自動完成與即時檢查。不採用「手寫 JSON Schema 加 Ajv」，以避免型別與 Schema 兩處維護而不同步

## Considered Options

- **擴充 LRC（`{漢字|かな}` 加縮排的 `zh:`、`ro:` 附屬行）**：手寫最方便，且一般 LRC 可直接相容，但結構較鬆散、驗證困難
- **手寫 JSON Schema 加 Ajv**：見上
