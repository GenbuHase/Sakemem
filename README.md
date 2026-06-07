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
| `NEXT_PUBLIC_SITE_URL` | 認証メールのリダイレクト先（ローカル: `http://localhost:3000`） |

### 3. データベース

Supabase SQL Editor で `supabase/migrations/001_create_records.sql` を実行するか、Supabase CLI を使ってマイグレーションを適用します。

```bash
# Supabase CLI を使う場合
supabase db push
```

### 4. 開発サーバー

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開きます。

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
4. Supabase にマイグレーションが未適用の場合は、本番 DB にも `001_create_records.sql` を実行します。

## 主な機能

- メール / パスワード認証（Supabase Auth）
- お酒のみ・おつまみのみ・ペアでの記録（`pair_id` によるペアリング、後から変更可能）
- タイムライン一覧
- 名前・カテゴリ・種別による検索・フィルタ
- カテゴリ別の記録数・平均評価の分析
- 日本酒カテゴリでのさけのわ API サジェスト
