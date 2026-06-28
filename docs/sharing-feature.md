# Sakemem 共有機能 — 設計メモ

> 作成日: 2026-06-07  
> 更新日: 2026-06-28  
> ステータス: 方針確定・実装待ち  
> 関連: [sharing-implementation-plan.md](./sharing-implementation-plan.md)（**本実装計画・手順書**）、[Sakemem_Context.md](../Sakemem_Context.md)、[performance-improvement.md](./performance-improvement.md)

**実装の詳細（DB・画面・OGP・工数・チェックリスト）は [sharing-implementation-plan.md](./sharing-implementation-plan.md) を参照。** 本書は背景・方針・議論の経緯を残す設計メモである。

## 1. 背景

ユーザーアンケートより、以下のフィードバックがあった。

- **共有機能があると嬉しい**
- **身近なユーザーのおすすめを見られると嬉しい**
- **購買行動につながりやすい**

現状の Sakemem は個人の晩酌ライフログとして設計されており、Supabase RLS により `auth.uid() = user_id` のレコードのみ閲覧可能（完全プライベート）。共有機能の追加は、データモデル・RLS・UI のいずれにも手を入れる **中〜大規模な改修** になる見込み。

## 2. 方針の整理

### 2.1 プロダクトの方向性

Sakemem を「SNS」にするのではなく、**信頼できる人の晩酌ノートの抜粋** として見せる方向が、ミニマルな思想とプライバシー要件の両方に合う。

- デフォルトはすべて非公開
- ユーザーが明示的に公開範囲を選ぶ（オプトイン）
- いきなりフォロー型 SNS にはしない

### 2.2 実装の段階分け

規模が大きいため、段階的に進める。

| フェーズ | 内容 | 規模感 |
| :--- | :--- | :--- |
| **Phase A（近い将来）** | 記録の外部共有（Twitter 等に投げられる形式）、公開プロフィールページ | 中 |
| **Phase B（将来）** | Sakemem 内フォロー / フレンド、フィード、おすすめ集約 | 大 |

**今回実装するのは Phase A のみ。** Twitter 等の SNS にそのまま貼れる形式での共有を優先する。**Sakemem 自体に SNS 機能（フォロー・フィード等）は持たせない。** アプリ内ソーシャルグラフは Phase B として別途設計・実装する。

### 2.3 確定方針（2026-06-28）

| 項目 | 決定内容 |
| :--- | :--- |
| アプリ内 SNS | **実装しない**（Phase B はスコープ外） |
| 公開プロフィール `/@username` | **実装する**（`public` 記録のみ一覧） |
| OGP | **動的生成**（`@vercel/og` で記録・プロフィールごとに OG 画像） |
| 公開範囲（Phase A） | **`private` / `unlisted` / `public` の 3 値のみ**（`friends` は DB に入れない） |
| プロフィール編集 | **`username` / `display_name` / `avatar_url` を設定画面から変更可**（詳細は §4.9） |
| `username` 変更 | **可**（旧 URL リダイレクトなし） |
| 工数目安 | **17.5〜23.5 人日**（詳細は [sharing-implementation-plan.md](./sharing-implementation-plan.md) §2） |

## 3. 公開範囲

記録ごとに以下のいずれかを設定する。デフォルトは `private`。

### 3.1 Phase A（今回実装）— 3 段階

| 値 | 説明 | 閲覧者 | プロフィール一覧 |
| :--- | :--- | :--- | :---: |
| `private` | 非公開（現状と同じ） | 本人のみ | — |
| `unlisted` | 限定公開 | URL を知っている人のみ | 載せない |
| `public` | 公開 | 誰でも | **載せる** |

### 3.2 Phase B（将来）— 追加予定

| 値 | 説明 | 閲覧者 |
| :--- | :--- | :--- |
| `friends` | フレンド限定 | 承認済みフレンドのみ（`friendships` テーブルが前提） |

### 補足

- Phase A では `friends` を **DB の CHECK 制約にも含めない**。Phase B 着手時に `ALTER` で追加する（[sharing-implementation-plan.md](./sharing-implementation-plan.md) §12 参照）。
- 場所（`place`）は `hide_place_when_shared` により共有時にマスク可能。

## 4. Phase A: 外部共有（Twitter 等）

### 4.1 ゴール

1 件の記録（またはペア）を、**SNS に投稿しやすい形** で外部に見せる。

- 共有用 URL: `/@[username]/[id]`（記録）、`/@[username]`（公開プロフィール）
- **動的 OGP**（Open Graph / Twitter Card）— 記録・プロフィールごとに `title` / `description` / OG 画像を生成
- 共有ボタンから URL コピー、X intent、Web Share API（モバイル）

### 4.2 共有ページで見せる内容

閲覧専用。編集・削除は不可。

| 項目 | 備考 |
| :--- | :--- |
| カテゴリ・銘柄名・蔵元/メーカー | 購買判断に直結 |
| 総合評価・味の評価軸 | 既存 `RecordDetail` の表示ロジックを流用可能 |
| メモ（`comment`） | 任意 |
| ペアのおつまみ | `pair_id` で結合（既存 `groupRecordsForTimeline` を再利用） |
| 日付 | 共有文脈として有用 |
| 場所（`place`） | ユーザー設定または公開範囲に応じてマスク可 |
| 投稿者 | 表示名 + 公開プロフィールへのリンク |

**載せないもの:** メールアドレス。記録 ID は URL に含むが、UUID v4 かつ `unlisted` / `public` 以外は参照不可とする。

### 4.3 Twitter 等への投稿イメージ

**共有 URL 例**

```
https://sakemem.example.com/@genbu/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

公開プロフィール:

```
https://sakemem.example.com/@genbu
```

**OGP / Twitter Card（Next.js `generateMetadata` + `opengraph-image.tsx`）**

- `title`: 例) `獺祭 純米大吟醸 ★5 | Sakemem`
- `description`: 評価・短いメモの抜粋、ペアおつまみがあれば「合わせて: 焼き鳥」
- `og:image`: **`@vercel/og` による動的生成**（銘柄名・評価・カテゴリ・ペアおつまみ・投稿者を画像に描画）。記録ページと公開プロフィールでレイアウトを分ける。
- `unlisted` 記録は `robots: noindex`、`public` のみ検索エンジンに index 可（初版）

レイアウト・フォント・検証手順の詳細は [sharing-implementation-plan.md](./sharing-implementation-plan.md) §7。

**投稿文テンプレート（コピー用）**

```
今夜の一杯 🍶
獺祭 純米大吟醸（株式会社獺祭）★5
合わせて: 焼き鳥
https://sakemem.example.com/@genbu/a1b2c3d4-e5f6-7890-abcd-ef1234567890
#Sakemem
```

実装では「URL コピー」「X で投稿」（`https://twitter.com/intent/tweet?text=...&url=...`）程度から始め、Web Share API はモバイル向けに追加。

### 4.4 ルーティング案

**ユーザー向け URL（正とする形式）**

| パス | 説明 | 認証 |
| :--- | :--- | :--- |
| `/@[username]` | 外部向け公開プロフィール | 不要（`public` 記録のみ一覧） |
| `/@[username]/[id]` | 単一記録（またはペア）の共有ページ | 不要（`unlisted` / `public`） |
| `/records` 既存 | 自分のタイムライン | 要ログイン |

- `username` は `profiles` テーブルでユニーク制約。英数字・アンダースコア・ハイフン程度に限定すると URL が扱いやすい（先頭の `@` はパスに含めない）。
- `[id]` は `records.id`（UUID）。`unlisted` はプロフィール一覧に出さないが、URL を知っていれば閲覧可能。
- `public` 記録はプロフィール一覧と直接 URL の両方から到達できる。

**Next.js 実装上の注意**

App Router では `@` で始まるディレクトリ名は Parallel Routes 用の予約であり、URL セグメントにはならない。そのため公開 URL は `/@username` としつつ、内部は次のいずれかで実装する。

1. **Middleware rewrite（推奨）:** `/@:username` → `/profile/:username`、`/@:username/:id` → `/profile/:username/:id` のように内部パスへ書き換え
2. **`next.config` の `rewrites`** で同等のマッピング

ユーザーがコピー・投稿する URL は常に `/@[username]` 形式とする（内部パスは外部に露出しない）。

**共有 URL の組み立て**

```ts
// 例: src/lib/sharing/build-share-url.ts
`${siteUrl}/@${profile.username}/${record.id}`
```

### 4.5 データベース変更案

```sql
-- プロフィール（auth.users の拡張）
CREATE TABLE public.profiles (
  id           uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username      text        UNIQUE NOT NULL,  -- 公開 URL 用
  display_name  text        NOT NULL,
  avatar_url    text,                        -- プロフィール画像 URL（Supabase Storage）
  bio           text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- records への追加（Phase A は 3 値のみ）
ALTER TABLE public.records
  ADD COLUMN visibility text NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'unlisted', 'public')),
  ADD COLUMN hide_place_when_shared boolean NOT NULL DEFAULT false;
```

- 共有 URL は `/@{username}/{records.id}` で一意に決まるため、別途 `share_token` カラムは不要。
- インデックス: `profiles(username)`、`records(user_id, visibility)` where `visibility = 'public'`。
- マイグレーション正本: `supabase/migrations/005_sharing_and_profiles.sql`（[sharing-implementation-plan.md](./sharing-implementation-plan.md) §4）

### 4.6 共有データ取得（確定方針）

`anon` に `records` テーブルへ広い SELECT ポリシーを足すのではなく、**SECURITY DEFINER 関数** で公開フィールドのみ返す（採用済み）。

| 関数 | 用途 |
| :--- | :--- |
| `get_shared_record(username, record_id)` | 記録共有ページ。`unlisted` / `public` のみ。`user_id` は返さない |
| `get_public_profile(username)` | プロフィールヘッダー |
| `get_public_profile_records(username)` | `public` 記録一覧（`unlisted` は含めない） |

- `private` および存在しない組み合わせはすべて **404**（403 にしない）。
- 本人向けの CRUD は既存 RLS（`auth.uid() = user_id`）のまま。

SQL 全文は [sharing-implementation-plan.md](./sharing-implementation-plan.md) §4.3。

### 4.7 UI 変更案（Phase A）

| 場所 | 変更 |
| :--- | :--- |
| 記録編集画面 | 公開範囲セレクタ、`hide_place_when_shared` チェック |
| 記録詳細 / タイムライン | 「共有」ボタン → URL コピー / X intent |
| `/@[username]` | プロフィール画像・表示名・bio・公開記録一覧（ペアカード） |
| `/@[username]/[id]` | 共有専用レイアウト（`RecordDetail` `showActions={false}`） |
| 新規登録後 / 既存ユーザー初回ログイン | `profiles` 作成フロー（`username` 必須）。記録は可、共有は username 設定後 |
| `/settings/profile` | プロフィール編集（`username` / `display_name` / `avatar_url` / `bio`）— §4.9 |

### 4.8 既存コードとの接続

| 既存 | 用途 |
| :--- | :--- |
| `RecordDetail` | 共有ビュー（`showActions={false}`） |
| `groupRecordsForTimeline` | ペア表示 |
| `analyzeRecords` | 将来 Phase B のおすすめ集約 |
| `filter-records` | 公開プロフィールの絞り込み |

新規想定（詳細なファイル一覧は [sharing-implementation-plan.md](./sharing-implementation-plan.md) §6）:

```
src/lib/sharing/              # 共有 URL・テキスト・RPC ラッパー
src/lib/profiles/             # プロフィール CRUD・画像アップロード
src/lib/metadata/             # OGP メタデータ組み立て
src/app/profile/[username]/           # 公開プロフィール + opengraph-image.tsx
src/app/profile/[username]/[id]/      # 共有記録 + opengraph-image.tsx
src/app/onboarding/profile/           # 初回プロフィール設定
src/app/settings/profile/             # プロフィール編集
src/components/profiles/              # 設定フォーム・アバターアップロード
src/proxy.ts                          # /@username → /profile/username へ rewrite
supabase/migrations/005_sharing_and_profiles.sql
```

### 4.9 プロフィール編集（公開向け）

公開プロフィール `/@username` に載る見た目を、本人がいつでも調整できるようにする。オンボーディング（初回設定）と設定画面（継続編集）で **同じフォーム部品** を共有する。

#### 4.9.1 編集可能フィールド

| フィールド | DB カラム | 公開面での表示 | 変更時の影響 |
| :--- | :--- | :--- | :--- |
| ユーザー名 | `username` | `/@username` の URL・OGP の `@username` | **共有 URL がすべて変わる**（旧 URL は 404） |
| 表示名 | `display_name` | プロフィールヘッダー・記録共有ページの投稿者名・OGP | URL には影響しない |
| プロフィール画像 | `avatar_url` | プロフィールヘッダー・アバター・OGP（任意） | URL には影響しない |
| 自己紹介 | `bio` | プロフィールヘッダー・OGP 抜粋 | URL には影響しない |

`avatar_url` が未設定のときは、表示名の頭文字を使った **プレースホルダーアバター**（CSS / SVG）を表示する。メールアドレスや `auth.users` のメタデータは公開面に出さない。

#### 4.9.2 `username` 変更のルール

初版から変更を許可する。変更時は次を守る。

- **形式:** 3〜30 文字、`[a-zA-Z0-9_-]` のみ（オンボーディングと同一）
- **一意性:** `lower(username)` でユニーク（大文字小文字は区別しない）
- **確認 UI:** 保存前に「共有 URL が `/@{新username}` に変わり、旧 URL は使えなくなる」旨を明示
- **旧 URL:** リダイレクトは **初版では実装しない**（404）。将来 `username_aliases` テーブルで対応可能

#### 4.9.3 `avatar_url` の保存方針

- **保存先:** Supabase Storage バケット `profile-images`（公開読み取り）
- **パス:** `{user_id}/{uuid}.webp`（上書きではなく新規オブジェクト。DB の URL のみ更新）
- **制約:** JPEG / PNG / WebP、最大 2 MB。サーバー側でリサイズ（正方形 512px 程度）して WebP 化を推奨
- **削除:** 「画像を削除」で `avatar_url` を `NULL` にし、Storage 上のオブジェクトは非同期クリーンアップ（初版は DB のみ NULL でも可）

#### 4.9.4 設定画面 UI（`/settings/profile`）

認証必須。ヘッダーの「プロフィール設定」またはアカウントメニューから遷移。

```
┌─────────────────────────────────────────┐
│  プロフィール設定                        │
├─────────────────────────────────────────┤
│  [ 画像プレビュー ]  [ 画像を選ぶ ]      │
│                      [ 画像を削除 ]      │
│  推奨: 正方形・512px 以上                │
├─────────────────────────────────────────┤
│  表示名 *                                │
│  [________________________]              │
├─────────────────────────────────────────┤
│  ユーザー名 *                            │
│  sakemem.example.com/@ [________]       │
├─────────────────────────────────────────┤
│  自己紹介（任意）                        │
│  [________________________]              │
│  [________________________]              │
├─────────────────────────────────────────┤
│  公開プロフィール: /@genbu  [プレビュー] │
│                                         │
│              [ 保存する ]                │
└─────────────────────────────────────────┘
```

- **画像:** クリックまたはドラッグ＆ドロップで選択 → クライアントでプレビュー → 保存時に Storage アップロード → 返却 URL を `avatar_url` に保存
- **ユーザー名:** 入力中に利用可否を非同期チェック（debounce）。変更時は確認ダイアログ
- **保存後:** トースト表示 + `revalidatePath` で公開プロフィール・該当記録の OGP キャッシュを更新
- **username 変更時:** 新 `/@username` へのリンクを結果画面で案内

オンボーディング（`/onboarding/profile`）は上記のうち **画像・表示名・ユーザー名・bio** を必須/任意の組み合わせで初回のみ表示。`avatar_url` はオンボーディングでは **任意**（スキップ可）。

#### 4.9.5 API・実装の接続

| 処理 | 実装 |
| :--- | :--- |
| プロフィール取得（本人） | `profiles` を RLS `auth.uid() = id` で SELECT |
| プロフィール更新 | Server Action `updateProfile` — `display_name` / `bio` / `username`（一意性チェック付き） |
| 画像アップロード | 署名付き URL または Server Action 経由で Storage に PUT → 返却 URL を `avatar_url` に保存 |
| 公開面 | 既存 RPC `get_public_profile` 等が `avatar_url` を返す |

## 5. Phase B: アプリ内フォロー（将来・大規模）

アンケートの「身近なユーザーのおすすめ」に直結するが、Phase A 完了後に着手する。

### 5.1 追加要素

- `friendships` テーブル（`pending` / `accepted` / `blocked`）
- `visibility = 'friends'` の RLS
- `/feed` — フレンドの共有記録タイムライン
- `/recommendations` — `name + producer + category` で集約したおすすめ
- `/friends` — 申請・承認・一覧
- 記録作成時の「フレンドの高評価銘柄」サジェスト
- ウィッシュリスト（「試してみたい」）

### 5.2 見送り（Phase B まで不要）

- 銘柄マスターテーブル（日付ごと独立レコードのまま集約クエリで対応）
- アフィリエイトリンク
- 全文検索エンジン

## 6. プライバシー・セキュリティ

1. **デフォルト `private`** — 既存ユーザー・新規記録とも変更なし。
2. **共有の取り消し** — `visibility` を `private` に戻すと即非公開（URL を知っていても 404）。
3. **メール非露出** — 公開面は `display_name` / `username` のみ。
4. **場所のマスク** — 自宅・常連店など、ユーザーが選べるようにする。
5. **`unlisted` と `public` の違いを UI で明確に** — 検索・プロフィール一覧に載るかどうか。
6. **レート制限** — 記録 ID の列挙攻撃対策（UUID v4・`username` と `user_id` の一致検証・404 統一）。

## 7. 開発ロードマップ

Phase A の実装ステップ（チェックリスト付き）は [sharing-implementation-plan.md](./sharing-implementation-plan.md) §10 を正とする。

| Step | 内容 | 依存 |
| :--- | :--- | :--- |
| Step 1 | `profiles`、オンボーディング、`username` バリデーション | — |
| Step 1b | プロフィール設定画面、`avatar_url` Storage、プロフィール更新 Action | Step 1 |
| Step 2 | `visibility`、SECURITY DEFINER RPC | Step 1 |
| Step 3 | 公開プロフィール・共有記録ページ、`proxy.ts` rewrite | Step 2 |
| Step 4 | 動的 OGP（`generateMetadata` + `opengraph-image.tsx`） | Step 3 |
| Step 5 | 編集 UI（公開範囲）、共有ボタン | Step 4 |
| Step 6 | QA・ドキュメント・本番 OG 検証 | Step 5 |
| Phase B | フォロー、フィード、おすすめ集約 | Phase A 完了後 |

## 8. 決定事項・残課題

### 決定済み（2026-06-28）

- [x] 公開プロフィールに載せる記録: **`public` のみ**（`unlisted` はプロフィール一覧に出さない）
- [x] プロフィール編集: **`/settings/profile` で `username` / `display_name` / `avatar_url` を変更可**
- [x] `username` 変更: **可**（旧 URL リダイレクトなし）
- [x] プロフィール画像: **Supabase Storage `profile-images`**（`avatar_url` カラムに URL）
- [x] OG 画像: **動的生成**（`@vercel/og`）
- [x] アプリ内 SNS: **Phase A では実装しない**
- [x] `friends` visibility: **Phase A では DB にも入れない**
- [x] プロフィール一覧の件数上限: **50 件**（初版はページネーションなし）

### 実装着手前に最終確認（軽微）

- [ ] ペアの片方が `private` のとき、共有ページで単体表示とするか 404 とするか（推奨: 単体表示）
- [ ] 公開プロフィールの Header デザイン（ログインリンクのみの簡易ヘッダー推奨）

## 9. 参考: アンケートニーズと機能の対応

| ニーズ | Phase A | Phase B |
| :--- | :---: | :---: |
| SNS に投稿して共有 | ✅ | — |
| 外部からプロフィールを見る | ✅（public） | — |
| 身近な人のおすすめ | △（URL 経由） | ✅ |
| 購買につながる情報（銘柄・評価・ペア） | ✅ | ✅（集約・サジェスト） |

---

## 10. ドキュメントの役割分担

| ドキュメント | 役割 |
| :--- | :--- |
| **本書（sharing-feature.md）** | 背景、アンケート、Phase A/B の議論、方針の経緯 |
| [sharing-implementation-plan.md](./sharing-implementation-plan.md) | 確定スコープ、DB・RPC・画面・動的 OGP・手順・工数 |
| [performance-improvement.md](./performance-improvement.md) | プライベート領域の SPA 風化（共有ページの SSR と共存） |
| [Sakemem_Context.md](../Sakemem_Context.md) | プロジェクト全体の正本（実装完了後に Step 11 として追記） |

---

*実装着手時は [sharing-implementation-plan.md](./sharing-implementation-plan.md) の Step 1 から進めること。*
