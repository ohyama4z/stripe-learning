---
description: Use Bun instead of Node.js, npm, pnpm, or vite.
globs: '*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json'
---

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";

// import .css files directly and it works
import './index.css';

import { createRoot } from "react-dom/client";

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.md`.

---

# This Project Structure

このプロジェクトはBun Workspaceを使用したモノレポ構成です。

## Directory Structure

```
stripe-learning/
├── app/              # Honoバックエンド (Port: 3001)
│   ├── src/
│   │   └── index.ts  # Hono API server with CORS & Logger
│   ├── package.json
│   └── tsconfig.json
├── ui/               # Vite + React フロントエンド (Port: 5173)
│   ├── src/
│   │   ├── App.tsx   # Main app with useSWR
│   │   └── main.tsx
│   ├── vite.config.ts  # Proxy configuration for /api
│   └── package.json
├── lib/              # 共通モジュール
│   ├── src/
│   │   └── index.ts  # Shared utilities
│   └── package.json
└── package.json      # Root workspace configuration
```

## Available Scripts

### Development

- `bun run dev` - 並列でappとuiを起動
- `bun run dev:app` - Honoサーバーのみ起動 (localhost:3001)
- `bun run dev:ui` - Viteサーバーのみ起動 (localhost:5173)

### Build

- `bun run build` - 全体をビルド (lib → app → ui の順)
- `bun run build:app` - appのみビルド
- `bun run build:ui` - uiのみビルド
- `bun run build:lib` - libのみビルド

### Code Quality

- `bun run lint` - ESLintで全体をチェック
- `bun run format` - Prettierで全体をフォーマット
- `bun run format:check` - フォーマットのチェックのみ
- `bun run typecheck` - appとuiの型チェック

### Git Hooks

- `bun run setup-hooks` - pre-commitフックをセットアップ

## Technology Stack

- **Backend**: Hono (with CORS & Logger) - Port 3001
- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS v4 + shadcn/ui - Port 5173
- **Data Fetching**: useSWR
- **Code Quality**: ESLint (typescript-eslint v8) + Prettier + lint-staged

## Key Files

- **API定義**: `app/src/index.ts` - Honoのルート定義を参照
- **UI設定**: `ui/components.json`, `ui/tailwind.config.ts` - shadcn/ui設定
- **プロキシ**: `ui/vite.config.ts` - `/api/*` → `http://localhost:3001`
- **共通設定**: `eslint.config.mjs`, `.prettierrc` - ルートで一元管理

## Setup

```bash
bun install                # 依存関係インストール
bun run setup-hooks        # Git hooks初回セットアップ
bun run dev                # 開発サーバー起動 (app + ui)
```

shadcn/uiコンポーネント追加: `npx shadcn@latest add <component-name>`

---

# Stripe学習ロードマップ

## 進捗状況

| # | トピック | ステータス | 完了日 |
|---|----------|------------|--------|
| 1 | セットアップ (SDK導入、APIキー設定) | ✅ 完了 | 2025-12-26 |
| 2 | 単発決済 (Checkout Session) | 🔄 進行中 | - |
| 3 | Webhook (決済完了通知) | ⬚ 未着手 | - |
| 4 | サブスクリプション (月額課金) | ⬚ 未着手 | - |
| 5 | Connect (プラットフォーム向け分配) | ⬚ 未着手 | - |

## 学習メモ

### Step 1: セットアップ
- [x] Stripe SDKインストール (`bun add stripe`)
- [x] テスト用APIキーを`.env`に設定
- [x] 疎通確認 (Balance API で確認完了)

### Step 2: 単発決済 (Checkout Session)
- [ ] 商品・価格の作成
- [ ] Checkout Session APIエンドポイント作成
- [ ] 決済フローの実装（フロントエンド）
- [ ] 成功/キャンセルページの作成
