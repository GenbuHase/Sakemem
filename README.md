# Sakemem（サケメム）

晩酌のお酒とおつまみをミニマルに記録するライフログアプリです。

## 技術スタック

- **Frontend / API:** Next.js 16（App Router）
- **Database / Auth:** Supabase（PostgreSQL + Supabase Auth）
- **External API:** [さけのわAPI](https://sakenowa.com)（日本酒の銘柄・蔵元サジェスト）

設計の詳細は [Sakemem_Context.md](./Sakemem_Context.md) を参照してください。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数

`.env.example` をコピーして `.env.local` を作成し、値を設定します。

```bash
cp .env.example .env.local
```

| 変数 | 説明 |
| :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon（公開）キー |
| `NEXT_PUBLIC_SITE_URL` | アプリの公開 URL（認証リダイレクト・**共有リンク・OGP** に必須。ローカル: `http://localhost:3000`） |

### 3. データベース

Supabase SQL Editor でマイグレーションを実行するか、Supabase CLI を使って適用します。**共有機能を使う場合は `005_sharing_and_profiles.sql` まで必要です。**

```bash
# Supabase CLI を使う場合（プロジェクト link 済み）
supabase db push
```

新規 DB の場合は `supabase/migrations/001` から `005` まで順に適用してください。既存 DB では `005` のみで足ります。

### 4. 開発サーバー

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開きます。

**共有機能の動作確認**（プロフィール設定・公開範囲・`/@username` など）の詳細は [docs/sharing-implementation-plan.md](./docs/sharing-implementation-plan.md) §15 を参照してください。要点:

1. `.env.local` の `NEXT_PUBLIC_SITE_URL` を `http://localhost:3000` に設定
2. Supabase に `005_sharing_and_profiles.sql` を適用
3. Supabase Auth の Redirect URLs に `http://localhost:3000/auth/callback` を登録
4. ログイン → プロフィール設定 → 記録を `unlisted` / `public` に変更 → `/@{username}/{id}` で確認

## スクリプト

| コマンド | 説明 |
| :--- | :--- |
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint |
| `npm test` | ユニットテスト（Vitest） |

## Vercel へのデプロイ

1. GitHub リポジトリを Vercel にインポートします。
2. **Environment Variables** に `.env.example` と同じ 3 変数を設定します。
   - `NEXT_PUBLIC_SITE_URL` は本番 URL（例: `https://sakemem.vercel.app`）にします。
3. デプロイ後、Supabase の **Authentication → URL Configuration** で以下を設定します。
   - **Site URL:** 本番アプリ URL
   - **Redirect URLs:** `https://your-domain/auth/callback`
4. Supabase にマイグレーションが未適用の場合は、本番 DB にも `001` から `005` まで適用します（既存 DB なら `005` のみで可）。
5. 共有機能の OG 検証は X Card Validator 等で `/@username` と記録 URL を確認します。

## 主な機能

- メール / パスワード認証（Supabase Auth）
- お酒のみ・おつまみのみ・ペアでの記録（`pair_id` によるペアリング、後から変更可能）
- タイムライン一覧
- 名前・カテゴリ・種別による検索・フィルタ
- カテゴリ別の記録数・平均評価の分析
- 日本酒カテゴリでのさけのわ API サジェスト
- **共有（Phase A）:** プロフィール（`/@username`）、記録の公開範囲（`private` / `unlisted` / `public`）、共有ページ・動的 OGP、URL コピー / X intent / Web Share API

共有機能の設計・実装詳細は [docs/sharing-feature.md](./docs/sharing-feature.md) と [docs/sharing-implementation-plan.md](./docs/sharing-implementation-plan.md) を参照してください。
