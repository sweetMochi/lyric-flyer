# Lyric Flyer

類似 YouTube Music 歌詞功能的個人歌詞播放器，需求見 [docs/PRD.md](docs/PRD.md)，用語見 [GLOSSARY.md](GLOSSARY.md)

## 開發

```bash
npm install
npm start              # 開發伺服器 http://localhost:4200/
npm test               # Vitest（監看模式），CI 使用 npm test -- --watch=false
npm run lint           # angular-eslint
npm run format:check   # Prettier 格式檢查，npm run format 自動修正
npm run build          # 正式版建置，輸出至 dist/lyric-flyer/browser
```

## 部署

推送到 `main` 時，GitHub Actions（[.github/workflows/deploy.yml](.github/workflows/deploy.yml)）會檢查、測試、建置並部署到 GitHub Pages。路由採 hash 模式（[ADR 0001](docs/adr/0001-pure-frontend-no-backend.md)），重新整理任何頁面都不會 404

首次部署前需在 repo 的 Settings → Pages 將 Source 設為「GitHub Actions」
