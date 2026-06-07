# Sakemem 共有機能 — 設計メモ

> 作成日: 2026-06-07  
> ステータス: 設計検討中（未実装）  
> 関連: [Sakemem_Context.md](../Sakemem_Context.md)

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

**今回の想定は Phase A。** Twitter 等の SNS にそのまま貼れる形式での共有を優先する。アプリ内ソーシャルグラフ（フォロー機能）は Phase B として別途設計・実装する。

## 3. 公開範囲（4 段階）

記録ごとに以下のいずれかを設定する。デフォルトは `private`。

| 値 | 説明 | 閲覧者 |
| :--- | :--- | :--- |
| `private` | 非公開（現状と同じ） | 本人のみ |
| `friends` | フレンド限定 | Phase B で実装。承認済みフレンドのみ |
| `unlisted` | 限定公開 | URL を知っている人のみ（検索・一覧に出ない） |
| `public` | 公開 | 誰でも（プロフィールページ・検索に載せるかは要検討） |

### 補足

- Phase A では `private` / `unlisted` / `public` の 3 つを先に実装し、`friends` はスキーマと RLS のみ用意（または CHECK 制約に含めて UI は後回し）でもよい。
- `friends` を先に DB に入れておくと、Phase B 移行時のマイグレーション負荷を下げられる。
- 場所（`place`）は共有時に非表示にするオプションがあると安心（例: `hide_place_on_share boolean`、または共有ビュー側でマスク）。

## 4. Phase A: 外部共有（Twitter 等）

### 4.1 ゴール

1 件の記録（またはペア）を、**SNS に投稿しやすい形** で外部に見せる。

- 共有用 URL: `/@[username]/[id]`（記録）、`/@[username]`（公開プロフィール）
- OGP（Open Graph） / Twitter Card 用メタデータ
- 共有ボタンから URL コピー、または Web Share API / intent URL

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

**OGP / Twitter Card（Next.js `metadata`）**

- `title`: 例) `獺祭 純米大吟醸 ★5 | Sakemem`
- `description`: 評価・短いメモの抜粋、ペアおつまみがあれば「合わせて: 焼き鳥」
- `og:image`: 静的テンプレ or 動的 OG 画像（銘柄名・評価・カテゴリを描画）。初期はテンプレ 1 枚でも可。

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
  username     text        UNIQUE NOT NULL,  -- 公開 URL 用
  display_name text        NOT NULL,
  avatar_url   text,
  bio          text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- records への追加
ALTER TABLE public.records
  ADD COLUMN visibility text NOT NULL DEFAULT 'private'
    CHECK (visibility IN ('private', 'friends', 'unlisted', 'public')),
  ADD COLUMN hide_place_when_shared boolean NOT NULL DEFAULT false;
```

- 共有 URL は `/@{username}/{records.id}` で一意に決まるため、別途 `share_token` カラムは不要。
- インデックス: `profiles(username)`、`records(user_id, visibility)` where `visibility IN ('unlisted', 'public')`。

### 4.6 RLS 変更案

既存の `records_select_own` に加え、**匿名（`anon`）および認証済みユーザーの両方** から閲覧できるポリシーを追加。

```sql
-- 共有記録: username + record_id で取得
--   profiles.username = :username
--   AND records.id = :id
--   AND records.user_id = profiles.id
--   AND records.visibility IN ('unlisted', 'public')

-- 公開プロフィール一覧:
--   records.user_id = profiles.id AND records.visibility = 'public'
```

**注意:** `anon` に `records` 全体を開くと漏洩リスクが高い。推奨は次のいずれか。

1. **Server Component + 明示的クエリ:** `username`・`record_id`・`visibility` を組み合わせて 1 件だけ SELECT。`private` / `friends` は 404。
2. **SECURITY DEFINER 関数:** `get_shared_record(p_username text, p_record_id uuid)` が公開フィールドのみ返す。`user_id` と `username` の一致も関数内で検証する。

プロフィールページ用:

```sql
-- profiles: username で SELECT 可能（公開カラムのみ）
-- public 記録一覧は profiles.id = records.user_id AND visibility = 'public'
-- unlisted 記録はプロフィール一覧クエリに含めない
```

### 4.7 UI 変更案（Phase A）

| 場所 | 変更 |
| :--- | :--- |
| 記録編集画面 | 公開範囲セレクタ、`hide_place_when_shared` チェック |
| 記録詳細 / タイムライン | 「共有」ボタン → URL コピー / X intent |
| `/@[username]` | 表示名・bio・公開記録一覧（ペアカード） |
| `/@[username]/[id]` | 共有専用レイアウト（`RecordDetail` `showActions={false}`） |
| 新規登録後 | `profiles` 作成フロー（`username` 必須） |

### 4.8 既存コードとの接続

| 既存 | 用途 |
| :--- | :--- |
| `RecordDetail` | 共有ビュー（`showActions={false}`） |
| `groupRecordsForTimeline` | ペア表示 |
| `analyzeRecords` | 将来 Phase B のおすすめ集約 |
| `filter-records` | 公開プロフィールの絞り込み |

新規想定:

```
src/lib/sharing/              # 共有 URL 組み立て、OG 用テキスト
src/lib/profiles/             # プロフィール CRUD
src/app/profile/[username]/           # 公開プロフィール（内部）
src/app/profile/[username]/[id]/      # 共有記録ページ（内部）
src/middleware.ts または proxy.ts     # /@username → /profile/username へ rewrite
supabase/migrations/003_sharing_and_profiles.sql
```

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

## 7. 開発ロードマップ（案）

| Step | 内容 | 依存 |
| :--- | :--- | :--- |
| Step 9a | `profiles` テーブル、登録時プロフィール作成、`/@[username]`（public 記録のみ） | — |
| Step 9b | `records.visibility`、共有取得 API（username + id） | Step 9a |
| Step 9c | `/@[username]/[id]` 共有ページ、OGP メタデータ、middleware rewrite | Step 9b |
| Step 9d | 編集 UI（公開範囲）、共有ボタン（コピー / X intent） | Step 9c |
| Step 10+ | フォロー、フィード、おすすめ集約（Phase B） | Step 9 完了後 |

## 8. 未決定事項（実装前に決める）

- [ ] 公開プロフィールに載せる記録: `public` のみか、`unlisted` も本人が一覧で見られるか
- [ ] `username` 変更可否（変更時は旧 URL リダイレクトが必要）
- [ ] OG 画像: 静的 1 枚 vs 動的生成（`@vercel/og` 等）
- [ ] 未ログイン閲覧者にプロフィールのどこまで見せるか（件数上限、ページネーション）
- [ ] Phase A で `friends` を UI に出すか、DB のみ先行するか

## 9. 参考: アンケートニーズと機能の対応

| ニーズ | Phase A | Phase B |
| :--- | :---: | :---: |
| SNS に投稿して共有 | ✅ | — |
| 外部からプロフィールを見る | ✅（public） | — |
| 身近な人のおすすめ | △（URL 経由） | ✅ |
| 購買につながる情報（銘柄・評価・ペア） | ✅ | ✅（集約・サジェスト） |

---

*このドキュメントは実装前の設計メモである。着手時は [Sakemem_Context.md](../Sakemem_Context.md) のロードマップ（Step 9 以降）にも反映すること。*
