# jumper-lang.github.io

Documentation site of [Jumper](https://github.com/jumper-lang/jumper): https://jumper-lang.github.io

Built with [VitePress](https://vitepress.dev), deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

## Run locally

Requires Node.js 18+.

```
npm install
npm run dev
```

Open http://localhost:5173. `npm run build` builds the site into `docs/.vitepress/dist` and fails on dead links.

## Layout

| Path | What |
|---|---|
| `docs/*.md`, `docs/language/`, `docs/java/`, `docs/security/`, `docs/tools/` | English pages |
| `docs/ru/` | Russian pages, the same file names |
| `docs/.vitepress/config.mts` | navigation, sidebar, languages |
| `docs/.vitepress/jumper.tmLanguage.json` | Jumper highlighting (from jumper-vscode) |

A new page goes into both languages and into `sidebar()` in `config.mts`. Jumper code blocks use ` ```jumper `.
