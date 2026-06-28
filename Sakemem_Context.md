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
| **認証ルーティング** | `src/proxy.ts`（Next.js 16 の Proxy。セッション更新、`/records`・`/settings`・`/onboarding` 保護、`/@username` rewrite） |
| **Database / Auth** | Supabase（PostgreSQL + Supabase Auth、`@supabase/ssr`） |
| **External API** | [さけのわAPI](https://sakenowa.com)（日本酒選択時の銘柄・蔵元サジェスト） |
| **OG 画像** | `@vercel/og`（共有ページの動的 OG 画像生成） |
| **画像処理** | `sharp`（プロフィール画像のリサイズ・WebP 化） |
| **設定** | `next.config.ts` — Server Action `bodySizeLimit` / `proxyClientMaxBodySize` を `3mb`（プロフィール画像アップロード用） |
| **テスト** | Vitest（`npm test`） |
| **CI** | GitHub Actions（lint → test → build） |

## 3. 要件定義 & 機能要件（マルチユーザー対応）

1. **ユーザー認証:** Supabase Auth によるメール / パスワード認証。ユーザーごとのデータ隔離。
2. **記録機能 (C):** 単一の記録パネルでカテゴリを選択し、内容に応じてフォームが切り替わる。
   - **基本情報（共通）:** 日付・場所（`place`）。新規作成時は、同一フォームで保存するお酒・ペアおつまみすべてに同じ場所が入る。
   - **カテゴリがおつまみ:** おつまみ用の入力項目（名前・補助情報・評価・味の評価・メモ）を表示し、`category: 'food'` として単体保存。`producer`・`style` は使用しない。
   - **カテゴリがお酒など（おつまみ以外）:** 酒類用の入力項目（種類・名前・蔵元/メーカー・補助情報・評価・味の評価・メモ）を表示。`food`・`other` 以外の酒類カテゴリでは種類（`style`）をセレクトで選択可能（任意）。任意で「おつまみも同時に記録する（ペア）」をオンにすると、同一パネル内にペア用おつまみ欄が展開され、複数レコードを共通の `pair_id` で保存。**おつまみは1件以上、複数件追加可能。**
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
   - **キーワード（`q`）:** 名前・蔵元/メーカー・種類（表示ラベル）・補助情報・場所・メモを対象とする。
   - **種別（`kind`）:** すべて / お酒のみ / おつまみのみ。
   - **カテゴリ（`category`）:** カテゴリ単位で絞り込み。
   - フィルタ適用中は分析サマリーを非表示にし、ヒット件数を表示する。
7. **分析 UI:** フィルタ未適用時、タイムライン上部に記録数・お酒/おつまみ件数・ペア記録数、およびカテゴリ別の件数・平均評価を表示する。
8. **動的評価軸:** `category`（および酒類の場合は `style`）に応じて、`flavor_metrics`（jsonb）内の評価パラメータを動的に切り替える（定義は `src/lib/constants/flavor-metrics.ts`・`src/lib/constants/drink-styles.ts` 参照）。総合評価（`rating`）は任意入力。ワイン・ウイスキーは種類ごとに評価軸が変わる。
9. **セキュリティ:** Supabase の Row Level Security（RLS）を有効化し、`auth.uid() = user_id` のポリシーを設定。他人のデータは閲覧・改ざんできないようにする。
10. **共有（Phase A）:** 記録ごとに公開範囲（`private` / `unlisted` / `public`）を設定可能。公開プロフィール `/@username` と記録共有ページ `/@username/[id]` を SSR で提供。外部共有（URL コピー、X intent、Web Share API）と動的 OGP。アプリ内 SNS（フォロー・フィード）は Phase B として未実装。詳細は [docs/sharing-feature.md](./docs/sharing-feature.md) を参照。

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
| `style` | text | | カテゴリ内の種類（例: ワインの `red`、ウイスキーの `scotch`）。酒類カテゴリで任意。`food`・`other` では `null` |
| `sub_info` | text | | 生産地・品種・熟成年数・料理のジャンル等の補助情報（種類とは別フィールド） |
| `place` | text | | 飲食した場所（店名・自宅 など） |
| `rating` | integer | CHECK（`NULL` または 1〜5） | 1〜5 の5段階評価（任意） |
| `flavor_metrics` | jsonb | default: `'{}'::jsonb` | カテゴリ特有の評価軸を KV で格納 |
| `comment` | text | | メモ・感想 |
| `visibility` | text | NOT NULL, default: `'private'`, CHECK（`private` / `unlisted` / `public`） | 公開範囲 |
| `hide_place_when_shared` | boolean | NOT NULL, default: `false` | 共有時に `place` を非表示にする |

**インデックス:** `(user_id, date DESC, created_at DESC)`、`pair_id`（`WHERE pair_id IS NOT NULL`）、`(user_id, date DESC, created_at DESC) WHERE visibility = 'public'`

### `profiles` テーブル

| カラム名 | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | uuid | PRIMARY KEY, REFERENCES `auth.users(id)` ON DELETE CASCADE | ユーザー ID（`auth.users` と 1:1） |
| `username` | text | NOT NULL, UNIQUE（`lower(username)`）, CHECK（3〜30 文字・`[a-zA-Z0-9_-]`） | 公開 URL 用（`/@username`） |
| `display_name` | text | NOT NULL | 表示名 |
| `avatar_url` | text | | プロフィール画像 URL（Storage `profile-images`） |
| `bio` | text | | 自己紹介 |
| `created_at` | timestamptz | NOT NULL, default: `now()` | 作成日時 |
| `updated_at` | timestamptz | NOT NULL, default: `now()` | 更新日時 |

**公開データ取得:** `anon` に `records` へ広い SELECT を付けず、SECURITY DEFINER RPC（`get_shared_record`, `get_public_profile`, `get_public_profile_records`, `get_shared_pair_records`）で公開フィールドのみ返す。

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

### カテゴリ別 `style` の値

`food`・`other` には種類セレクトなし。それ以外の酒類カテゴリでは、下記のキー値を `style` 列に格納する（UI では日本語ラベルで表示）。定義の正本は `src/lib/constants/drink-styles.ts`。

| カテゴリ | `style` キー（ラベル） |
| :--- | :--- |
| `japanese-sake` | `junmai`（純米）、`ginjo`（吟醸）、`daiginjo`（大吟醸）、`honjozo`（本醸造）、`namazake`（生酒）、`other`（その他） |
| `beer` | `lager`（ラガー）、`ale`（エール）、`ipa`（IPA）、`weizen`（ウィート）、`stout`（スタウト）、`other`（その他） |
| `wine` | `red`（赤）、`white`（白）、`rose`（ロゼ）、`sparkling`（スパークリング）、`other`（その他） |
| `sour` | `lemon`（レモン）、`grapefruit`（グレフル）、`calpis`（カルピス系）、`other`（その他） |
| `shochu` | `imo`（芋）、`mugi`（麦）、`kome`（米）、`other`（その他） |
| `whiskey` | `scotch`（スコッチ）、`bourbon`（バーボン）、`irish`（アイリッシュ）、`japanese`（ジャパニーズ）、`other`（その他） |
| `liqueur` | `fruit`（果実系）、`herb`（ハーブ系）、`cream`（クリーム系）、`other`（その他） |
| `cocktail` | `short`（ショート）、`long`（ロング）、`highball`（ハイボール系）、`other`（その他） |

### カテゴリ別 `flavor_metrics` キー

`style` 未選択時、または種類別の定義がないカテゴリでは、下記のカテゴリ既定値を使う。ワイン・ウイスキーは `style` に応じて評価軸が上書きされる。

| カテゴリ | 既定キー（ラベル） | `style` による上書き例 |
| :--- | :--- | :--- |
| `japanese-sake` | `sweetness`（甘み）、`acidity`（酸味）、`aroma`（香り） | — |
| `beer` | `bitterness`（苦味）、`body`（コク）、`aroma`（香り） | — |
| `wine` | `body`（ボディ）、`acidity`（酸味）、`aroma`（香り） | `red`: ボディ・渋み・酸味 / `white`: 酸味・香り・甘口度 / `sparkling`: 酸味・甘口度・香り 等 |
| `sour` | `acidity`（酸味）、`sweetness`（甘さ） | — |
| `shochu` | `aroma`（香り）、`umami`（旨み）、`finish`（キレ） | — |
| `whiskey` | `aroma`（香り）、`smoky`（スモーキー）、`finish`（キレ） | `bourbon`: 香り・甘み・キレ / `irish`・`japanese`: 香り・ボディ・キレ 等 |
| `liqueur` | `sweetness`（甘さ）、`acidity`（酸味）、`fruitiness`（果実感） | — |
| `cocktail` | `sweetness`（甘さ）、`acidity`（酸味）、`balance`（バランス） | — |
| `food` | `saltiness`（塩味）、`umami`（旨み）、`spiciness`（辛み） | — |
| `other` | `aroma`（香り）、`body`（コク）、`finish`（キレ） | — |

## 5. アプリ構成

### ルーティング

| パス | 説明 |
| :--- | :--- |
| `/` | ランディング（ログイン状態で CTA が切り替わる） |
| `/login`, `/signup` | 認証フォーム |
| `/auth/callback` | Supabase Auth コールバック |
| `/records` | タイムライン・検索・分析 |
| `/records/new` | 新規記録フォーム |
| `/records/[id]/edit` | 記録編集・ペアリング管理・削除・公開範囲設定 |
| `/onboarding/profile` | 初回プロフィール設定（username 必須） |
| `/settings/profile` | プロフィール編集（username / 表示名 / 画像 / bio） |
| `/@{username}` | 公開プロフィール（内部: `/profile/[username]`。`public` 記録のみ） |
| `/@{username}/{id}` | 記録共有ページ（`unlisted` / `public`。閲覧専用） |
| `/api/sakenowa/suggest` | さけのわ API プロキシ（`?q=`） |

`/@username` 形式は `src/proxy.ts`（middleware）が `/profile/[username]` へ rewrite する。公開ページは SSR + `generateMetadata` + `opengraph-image.tsx`。

### 主要なコード配置

```
src/
├── app/
│   ├── actions/          # Server Actions（auth, records, profiles）
│   ├── api/sakenowa/     # さけのわサジェスト API
│   ├── auth/callback/    # 認証コールバック
│   ├── login, signup/    # 認証ページ
│   ├── onboarding/profile/  # 初回プロフィール設定
│   ├── settings/profile/    # プロフィール編集
│   ├── profile/[username]/  # 公開プロフィール・共有記録（SSR）
│   └── records/          # タイムライン・新規・編集
├── components/
│   ├── auth/             # 認証フォーム
│   ├── layout/           # PublicHeader（公開ページ用）
│   ├── profiles/         # profile-settings-form, profile-avatar-upload, profile-public-preview-card, username-field
│   ├── records/          # 記録 UI（フォーム、タイムライン、フィルタ、分析）
│   ├── sharing/          # 共有ボタン・公開範囲セレクタ
│   └── ui/               # 共通 UI プリミティブ
├── lib/
│   ├── auth/             # requireUser 等
│   ├── constants/        # カテゴリ・種類・評価軸定義
│   ├── metadata/         # OGP メタデータ・フォント読み込み
│   ├── profiles/         # repository, validate-username, upload-avatar, delete-avatar-storage
│   ├── records/          # ドメインロジック（フィルタ、分析、ペアリング、リポジトリ）
│   ├── sharing/          # 共有 URL・RPC ラッパー・place マスク
│   ├── sakenowa/         # さけのわ API クライアント
│   ├── supabase/         # Supabase クライアント・セッション
│   └── types/            # 型定義
└── proxy.ts              # セッション更新・保護ルート・/@username rewrite
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
| Step 9 | 酒類の種類（`style`）フィールド追加、カテゴリ別種類セレクト・種類別評価軸 | ✅ 完了 |
| Step 10 | パフォーマンス改善（タイムラインのクライアントサイド移行、即時ローディング遷移の導入） | ✅ 完了 |
| Step 11 | 共有機能 Phase A（プロフィール、公開範囲、公開ページ、動的 OGP、共有 UI） | ✅ 完了 |

**現状:** MVP・パフォーマンス改善に加え、共有機能 Phase A まで実装済み（`alpha-0.3.14.2`）。2026-06-29 時点でプロフィール画像のアップロード即時 DB 反映・Storage クリーンアップ・username 変更 UX も反映済み。Phase B（フォロー・フィード等）は未着手。各環境への `005_sharing_and_profiles.sql` 適用と本番 OG 検証はデプロイ時に実施。

### 関連ファイル

- **マイグレーション:** `supabase/migrations/001_create_records.sql` 〜 `005_sharing_and_profiles.sql`
- **共有機能ドキュメント:** `docs/sharing-feature.md`, `docs/sharing-implementation-plan.md`
- **環境変数テンプレート:** `.env.example`
- **セットアップ・デプロイ手順:** `README.md`（ローカル確認は implementation-plan §15）
- **CI:** `.github/workflows/ci.yml`
- **テスト:** `src/lib/records/*.test.ts`、`src/lib/profiles/*.test.ts`（`upload-avatar`、`delete-avatar-storage`、`validate-username` 含む）、`src/lib/sharing/build-share-url.test.ts`、`src/lib/constants/drink-styles.test.ts`
