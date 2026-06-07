# Sakemem (サケメム) - Context & Design Doc

## 1. プロジェクト概要

ユーザーが日々の晩酌（あらゆるお酒とおつまみ）の記録をミニマルにストックしていくライフログアプリ。
当初は個人用だったが、複数ユーザーが安全に利用できるよう、認証とデータベースに Supabase（PostgreSQL）を採用。フロントおよび API は Vercel（Next.js）でホスティングする。

お酒とおつまみ（食べ物）を同じ「記録要素」としてフラットに扱い、お互いを `pair_id` で紐付けることで、お酒側からもおつまみ側からも自由な分析・検索を可能にする。

## 2. 技術スタック

| レイヤ | 技術 |
| :--- | :--- |
| **Frontend** | Next.js 16（App Router）、React 19、Tailwind CSS 4 |
| **Backend / API** | Next.js Server Actions、Route Handlers（`/api/sakenowa/suggest`） |
| **認証ルーティング** | `src/proxy.ts`（Next.js 16 の Proxy。セッション更新と `/records` 保護） |
| **Database / Auth** | Supabase（PostgreSQL + Supabase Auth、`@supabase/ssr`） |
| **External API** | [さけのわAPI](https://sakenowa.com)（日本酒選択時の銘柄・蔵元サジェスト） |
| **テスト** | Vitest（`npm test`） |
| **CI** | GitHub Actions（lint → test → build） |

## 3. 要件定義 & 機能要件（マルチユーザー対応）

1. **ユーザー認証:** Supabase Auth によるメール / パスワード認証。ユーザーごとのデータ隔離。
2. **記録機能 (C):** 単一の記録パネルでカテゴリを選択し、内容に応じてフォームが切り替わる。
   - **基本情報（共通）:** 日付・場所（`place`）。新規作成時は、同一フォームで保存するお酒・ペアおつまみすべてに同じ場所が入る。
   - **カテゴリがおつまみ:** おつまみ用の入力項目（名前・補助情報・評価・味の評価・メモ）を表示し、`category: 'food'` として単体保存。`producer` は使用しない。
   - **カテゴリがお酒など（おつまみ以外）:** 酒類用の入力項目（名前・蔵元/メーカー・補助情報・評価・味の評価・メモ）を表示。任意で「おつまみも同時に記録する（ペア）」をオンにすると、同一パネル内にペア用おつまみ欄が展開され、複数レコードを共通の `pair_id` で保存。**おつまみは1件以上、複数件追加可能。**
   - **単体のお酒:** ペア用チェックをオフにすれば `pair_id` は `null`。
   - **データの単位:** 同じ銘柄・料理を別日・別店で飲食した場合は、それぞれ独立したレコードとして保存する（マスター集約はしない）。
3. **ペアリング管理 (U):** 作成後もペアリングを変更できる（編集画面の「ペアリング」セクション）。
   - **ペア解除:** 対象レコードの `pair_id` を `null` にする。ペアに残った記録が1件だけになった場合は、その記録の `pair_id` も自動的に `null` にする。
   - **ペア設定:** 未ペアのお酒と未ペアのおつまみ、または未ペアの片方と既存ペアの片方を `pair_id` で結合する（お酒↔おつまみのみ。同種カテゴリ同士はペア不可）。双方が別ペアに属している場合は `pair_id` をマージする。
4. **一覧表示機能 (R):** ログインユーザーの過去の記録をタイムライン形式で表示。同じ `pair_id` を持つお酒とおつまみは、フロントエンドで1つのペアリングカードとして結合して表示する。`pair_id` が `null` の記録は単体カードとして表示する。
5. **ハイブリッド入力補完:**
   - カテゴリが「日本酒」の場合：さけのわ API から銘柄・蔵元を自動サジェスト。候補選択時は銘柄名を `name`、蔵元名を `producer` に自動入力する。
   - その他のカテゴリ：自由入力。
6. **検索・フィルタ:**
   - **キーワード（`q`）:** 名前・蔵元/メーカー・補助情報・場所・メモを対象とする。
   - **種別（`kind`）:** すべて / お酒のみ / おつまみのみ。
   - **カテゴリ（`category`）:** カテゴリ単位で絞り込み。
   - フィルタ適用中は分析サマリーを非表示にし、ヒット件数を表示する。
7. **分析 UI:** フィルタ未適用時、タイムライン上部に記録数・お酒/おつまみ件数・ペア記録数、およびカテゴリ別の件数・平均評価を表示する。
8. **動的評価軸:** `category` に応じて、`flavor_metrics`（jsonb）内の評価パラメータを動的に切り替える（定義は `src/lib/constants/flavor-metrics.ts` 参照）。総合評価（`rating`）は任意入力。
9. **セキュリティ:** Supabase の Row Level Security（RLS）を有効化し、`auth.uid() = user_id` のポリシーを設定。他人のデータは閲覧・改ざんできないようにする。

## 4. データベース設計（Supabase / PostgreSQL）

### `records` テーブル

| カラム名 | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | uuid | PRIMARY KEY, default: `gen_random_uuid()` | 記録のユニーク ID |
| `user_id` | uuid | REFERENCES `auth.users(id)` ON DELETE CASCADE, NOT NULL | 投稿したユーザーの ID |
| `pair_id` | uuid | | 同時接続されたお酒とフードを紐付けるための共通 ID（任意） |
| `created_at` | timestamptz | NOT NULL, default: `now()` | レコード作成日時 |
| `date` | date | NOT NULL | ユーザーが選択した日付（YYYY-MM-DD） |
| `category` | text | NOT NULL, CHECK（下記カテゴリ一覧） | 記録カテゴリ |
| `name` | text | NOT NULL | 銘柄名・商品名、またはおつまみの料理名 |
| `producer` | text | | 蔵元・メーカー名（主にお酒。おつまみでは `null`） |
| `sub_info` | text | | スタイル、生産地、ビールスタイル、料理のジャンル等の補助情報 |
| `place` | text | | 飲食した場所（店名・自宅 など） |
| `rating` | integer | CHECK（`NULL` または 1〜5） | 1〜5 の5段階評価（任意） |
| `flavor_metrics` | jsonb | default: `'{}'::jsonb` | カテゴリ特有の評価軸を KV で格納 |
| `comment` | text | | メモ・感想 |

**インデックス:** `(user_id, date DESC, created_at DESC)`、`pair_id`（`WHERE pair_id IS NOT NULL`）

### カテゴリ一覧（`category`）

| 値 | 説明 | 内包する記録例 |
| :--- | :--- | :--- |
| `japanese-sake` | 日本酒 | 純米吟醸、生酒 等 |
| `beer` | ビール | ラガー、IPA、クラフトビール 等 |
| `wine` | ワイン | 赤・白・ロゼ・スパークリング 等 |
| `sour` | サワー・チューハイ系 | レモンサワー、グレフルサワー、酎ハイ 等（ハイボールは含めない） |
| `shochu` | 焼酎 | 芋焼酎、麦焼酎、焼酎ハイボール 等 |
| `whiskey` | ウイスキー | ストレート、ロック、水割り、**ウイスキーハイボール**（角ハイ等） |
| `liqueur` | リキュール | **梅酒（umeshu）**、果実系・ハーブ系リキュール 等 |
| `cocktail` | カクテル | モヒート、カシスオレンジ、ジンハイボール 等 |
| `food` | おつまみ・食べ物 | 枝豆、焼き鳥、チーズ 等 |
| `other` | その他 | 上記に当てはまらない酒類 |

### カテゴリ別 `flavor_metrics` キー

| カテゴリ | キー（ラベル） |
| :--- | :--- |
| `japanese-sake` | `sweetness`（甘み）、`acidity`（酸味）、`aroma`（香り） |
| `beer` | `bitterness`（苦味）、`body`（コク）、`aroma`（香り） |
| `wine` | `body`（ボディ）、`tannin`（渋み）、`acidity`（酸味） |
| `sour` | `acidity`（酸味）、`sweetness`（甘さ） |
| `shochu` | `aroma`（香り）、`umami`（旨み）、`finish`（キレ） |
| `whiskey` | `aroma`（香り）、`smoky`（スモーキー）、`finish`（キレ） |
| `liqueur` | `sweetness`（甘さ）、`acidity`（酸味）、`fruitiness`（果実感） |
| `cocktail` | `sweetness`（甘さ）、`acidity`（酸味）、`balance`（バランス） |
| `food` | `saltiness`（塩味）、`umami`（旨み）、`spiciness`（辛み） |
| `other` | `aroma`（香り）、`body`（コク）、`finish`（キレ） |

## 5. アプリ構成

### ルーティング

| パス | 説明 |
| :--- | :--- |
| `/` | ランディング（ログイン状態で CTA が切り替わる） |
| `/login`, `/signup` | 認証フォーム |
| `/auth/callback` | Supabase Auth コールバック |
| `/records` | タイムライン・検索・分析 |
| `/records/new` | 新規記録フォーム |
| `/records/[id]/edit` | 記録編集・ペアリング管理・削除 |
| `/api/sakenowa/suggest` | さけのわ API プロキシ（`?q=`） |

### 主要なコード配置

```
src/
├── app/
│   ├── actions/          # Server Actions（auth, records）
│   ├── api/sakenowa/     # さけのわサジェスト API
│   ├── auth/callback/    # 認証コールバック
│   ├── login, signup/    # 認証ページ
│   └── records/          # タイムライン・新規・編集
├── components/
│   ├── auth/             # 認証フォーム
│   ├── records/          # 記録 UI（フォーム、タイムライン、フィルタ、分析）
│   └── ui/               # 共通 UI プリミティブ
├── lib/
│   ├── auth/             # requireUser 等
│   ├── constants/        # カテゴリ・評価軸定義
│   ├── records/          # ドメインロジック（フィルタ、分析、ペアリング、リポジトリ）
│   ├── sakenowa/         # さけのわ API クライアント
│   ├── supabase/         # Supabase クライアント・セッション
│   └── types/            # 型定義
└── proxy.ts              # 認証セッション更新・保護ルート
```

## 6. 開発ロードマップ

| Step | 内容 | 状態 |
| :--- | :--- | :--- |
| Step 1 | `records` テーブル + RLS、Next.js 初期化、Supabase 環境変数 | ✅ 完了 |
| Step 2 | Supabase Auth（ログイン / 新規登録） | ✅ 完了 |
| Step 3 | 記録フォーム、タイムライン、CRUD | ✅ 完了 |
| Step 4 | さけのわ API 連携（日本酒サジェスト） | ✅ 完了 |
| Step 5 | 検索・フィルタ・分析 UI | ✅ 完了 |
| Step 6 | ペア削除の整合性、テスト、CI、デプロイ手順 | ✅ 完了 |
| Step 7 | おつまみ単体記録、ペアリングの後から変更 | ✅ 完了 |
| Step 8 | 蔵元/メーカー（`producer`）・飲食場所（`place`）フィールド追加 | ✅ 完了 |

**現状:** MVP 機能は一通り実装済み（`alpha-0.3.7`）。今後は UX 改善・機能追加を検討する段階。

### 関連ファイル

- **マイグレーション:** `supabase/migrations/001_create_records.sql`, `supabase/migrations/002_add_producer_and_place.sql`
- **環境変数テンプレート:** `.env.example`
- **セットアップ・デプロイ手順:** `README.md`
- **CI:** `.github/workflows/ci.yml`
- **テスト:** `src/lib/records/*.test.ts`（`analyze-records`, `filter-records`, `group-timeline`, `pairing`）
