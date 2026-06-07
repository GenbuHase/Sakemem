# Sakemem (サケメム) - Context & Design Doc

## 1. プロジェクト概要
ユーザーが日々の晩酌（あらゆるお酒とおつまみ）の記録をミニマルにストックしていくライフログアプリ。
当初は個人用だったが、複数ユーザーが安全に利用できるよう、認証とデータベースにSupabase（PostgreSQL）を採用。フロントおよびAPI RoutesはVercel（Next.js）でホスティングする。
お酒とおつまみ（食べ物）を同じ「記録要素」としてフラットに扱い、お互いをペアリングIDで紐付けることで、お酒側からもおつまみ側からも自由な分析・検索を可能にする。

## 2. 技術スタック
- **Frontend:** Next.js (App Router / Pages Router、Tailwind CSS)
- **Backend / API:** Vercel Serverless Functions (Next.js API Routes / Server Actions)
- **Database / Auth:** Supabase (PostgreSQL + Supabase Auth)
- **External API:** さけのわAPI (日本酒選択時の銘柄・蔵元サジェスト用)

## 3. 要件定義 & 機能要件 (マルチユーザー対応)
1. **ユーザー認証:** Supabase Authによるユーザーごとのデータ隔離。
2. **記録機能 (C):** お酒のカテゴリ、銘柄名、補助情報、評価、おつまみ、メモを保存。お酒だけでなく、おつまみも `category: 'food'` として個別のレコードで保存。同時に食べた（飲んだ）ものは `pair_id` で紐付ける。
3. **一覧表示機能 (R):** ログインユーザーの過去の記録をタイムライン形式で表示。同じ `pair_id` を持つお酒とおつまみは、フロントエンドで1つのペアリングカードとして結合して綺麗に表示する。
4. **ハイブリッド入力補完:**
   - カテゴリが「日本酒」の場合：さけのわAPIから銘柄・蔵元を自動サジェスト。
   - その他のカテゴリ：自由入力。
5. **動的評価軸**: `category` に応じて、`flavor_metrics` (jsonb) 内の評価パラメータを動的に切り替える（例：日本酒＝甘み/酸味/香り、ワイン＝ボディ/渋み/酸味、ウイスキー＝香り/スモーキー/キレ、フード＝塩味/旨み/辛み 等）。
6. **セキュリティ:** SupabaseのRow Level Security (RLS) を有効化し、`auth.uid() = user_id` のポリシーを設定。他人のデータは閲覧・改ざんできないようにする。

## 4. データベース設計 (Supabase / PostgreSQL)

### `records` テーブル
| カラム名 | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | uuid | PRIMARY KEY, default: gen_random_uuid() | 記録のユニークID |
| `user_id` | uuid | REFERENCES auth.users(id), NOT NULL | 投稿したユーザーのID |
| `pair_id` | uuid | | 同時接続されたお酒とフードを紐付けるための共通ID (任意) |
| `created_at` | timestamptz | default: now() | レコード作成日時 |
| `date` | date | NOT NULL | ユーザーが選択した日付 (YYYY-MM-DD) |
| `category` | text | NOT NULL | 下記「カテゴリ一覧」参照 |
| `name` | text | NOT NULL | 銘柄名・商品名、またはおつまみの料理名 |
| `sub_info` | text | | 蔵元、生産地、ビールスタイル、または料理のジャンル等の補助情報 |
| `rating` | integer | CHECK (rating >= 1 AND rating <= 5) | 1〜5の5段階評価 |
| `flavor_metrics` | jsonb | | カテゴリ特有の評価軸（日本酒の甘辛、ワインのボディ等）をKVで格納 |
| `comment` | text | | メモ・感想 |

### カテゴリ一覧 (`category`)

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

## 5. 開発ロードマップ

| Step | 内容 | 状態 |
| :--- | :--- | :--- |
| Step 1 | `records` テーブル + RLS、Next.js 初期化、Supabase 環境変数 | ✅ 完了 |
| Step 2 | Supabase Auth（ログイン / 新規登録） | ✅ 完了 |
| Step 3 | 記録フォーム、タイムライン、CRUD | ✅ 完了 |
| Step 4 | さけのわ API 連携（日本酒サジェスト） | ✅ 完了 |
| Step 5 | 検索・フィルタ・分析 UI | ✅ 完了 |
| Step 6 | ペア削除の整合性、テスト、CI、デプロイ手順 | ✅ 完了 |

### 関連ファイル

- マイグレーション: `supabase/migrations/001_create_records.sql`
- 環境変数テンプレート: `.env.example`
- セットアップ・デプロイ手順: `README.md`