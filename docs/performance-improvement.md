# Sakemem パフォーマンス改善方針 — 調査と対策

> 作成日: 2026-06-27  
> 完了日: 2026-06-27  
> ステータス: 対応完了  
> 関連: [Sakemem_Context.md](../Sakemem_Context.md), [sharing-feature.md](./sharing-feature.md)

## 1. 背景と現状の課題

ユーザーより「全体的に動作がもたついた印象を受ける」とのフィードバックがあり、原因の調査を行った。
特に「タイムラインでの検索・フィルタリング」および「各画面へのページ遷移」において遅延が顕著であった。

### もたつきの真の原因（対応前）

現在の Sakemem は Next.js の Server Components (SSR) をベースに構築されていたため、画面遷移やフィルタリングのたびに以下の箇所でボトルネックが発生していた。

1. **タイムラインでのフィルタリング時の再描画**:
   - `RecordFiltersForm` が `<form method="get">` を使用しており、検索時に URL クエリパラメータを更新してページ全体をサーバー側で再レンダリング (SSR) している。
   - サーバー側での再レンダリングのたびに、`requireUser()` (認証セッションチェック) と `getRecords()` (Supabase からのデータ全件取得) という外部ネットワーク通信が毎回発生していた。
2. **ページ遷移時のフリーズ感**:
   - `/records` ➔ `/records/new` や `/records/[id]/edit` などの遷移時にも、遷移先ページの Server Component 内でセッションチェックや DB 取得を待機していた。
   - これらが完了するまでブラウザ側での描画が開始されないため、クリックしてから画面が切り上がるまでの「もたつき（無反応時間）」となっていた。

---

## 2. 改善方針（ハイブリッド構成の採用）

将来の「[共有機能 (Phase A)](./sharing-feature.md)」の実装（SNS への動的 OGP 展開）を阻害せず、かつ SPA のようなサクサクした操作感を提供するために、**ページ単位でレンダリング方式を使い分けるハイブリッド構成**を採用し、これを実装した。

| 領域 | ルート / 機能 | レンダリング方式 | 改善内容 |
| :--- | :--- | :--- | :--- |
| **プライベート領域 (要認証)** | `/records`<br>`/records/new`<br>`/records/[id]/edit` | **SPA風 (Client-side Fetch / UI-first)** | - タイムラインのクライアントサイド・フィルタリング化<br>- `loading.tsx` の導入による即時ローディング遷移 |
| **パブリック領域 (共有用)** | `/@[username]`<br>`/@[username]/[id]` | **SSR (Server-side Rendering)** | 外部クローラーが JavaScript なしで動的 OGP メタデータを読み取れるよう、サーバー側で結合して HTML を生成する。 |

---

## 3. 具体的な実装方針

### 3.1 タイムラインのクライアントサイド・フィルタリング移行

最も頻繁に使用されるタイムラインの絞り込みを、サーバー通信なしで瞬時に完了させる。

- **実装内容**:
  - `RecordsPage` (`src/app/records/page.tsx`) は初期ロード時に `allRecords` を一度だけフェッチし、クライアントコンポーネント `TimelineContainer` に流し込む。
  - クライアント側で `useState` を使って検索文字列（`query`）、種別（`kind`）、カテゴリ（`category`）を管理。
  - 入力が変更されるたびに、ブラウザ上のメモリ内で `filterRecords` を実行し、タイムラインと統計情報を 0 秒で更新する。デバウンス（300ms）を挟むことでタイピングのレスポンスを高めた。
  - URL のクエリパラメータ同期には、Next.js の再レンダリングをトリガーしない `window.history.replaceState` を採用した。

### 3.2 遷移もたつきの解消: `loading.tsx` の導入

ページ遷移時の「フリーズしている感覚」を解消する。

- **実装内容**:
  - `src/app/records/loading.tsx`、`src/app/records/new/loading.tsx`、`src/app/records/[id]/edit/loading.tsx` を新規作成。
  - サーバーがデータをフェッチしている間、クライアント側で即座にスケルトンUIを描画し、体感上の待ち時間をゼロにした。

---

## 4. 将来 of 共有機能との整合性（検証）

[docs/sharing-feature.md](./sharing-feature.md) に計画されている共有ページは、クローラーに動的なメタデータ（OGP）を渡す必要がある。

- **影響**: アプリ全体を一律で SPA 化（`next.config` での完全静的エクスポートや SSR 無効化）してしまうと、クローラーが HTML を読み込んだ際に動的メタデータが空になってしまい、共有機能の価値が失われる。
- **解決策の妥当性**: 「プライベート領域のみ SPA 風にし、パブリック共有ページは SSR を維持する」ハイブリッド設計により、この問題は完全にクリアされた。

---

## 5. 実施された改善ステップ

当初予定していた以下の 4 ステップすべてに対応を完了した。

### Step 1: ページ遷移の高速化（ローディングUIの導入） ✅
最も迅速に適用でき、全体の遷移ストレスを大幅に軽減する。
1. **`src/app/records/loading.tsx` [NEW]** の作成（タイムラインスケルトン）
2. **`src/app/records/new/loading.tsx` [NEW]** / **`src/app/records/[id]/edit/loading.tsx` [NEW]** の作成（フォームスケルトン）

### Step 2: タイムラインのクライアントサイド・コンテナの構築 ✅
タイムライン画面のレンダリング構造をリファクタリングする。
1. **`src/components/records/timeline-container.tsx` [NEW]** の作成
   - `"use client"` ディレクティブ。`useState` で `query`, `kind`, `category` を管理し、URL を同期。
2. **`src/app/records/page.tsx` [MODIFY]** の変更
   - サーバー側から `allRecords` と初期フィルタ値を `TimelineContainer` に渡して描画を委ねる構成に変更。

### Step 3: フィルタフォームとタイムライン表示のリアクティブ化 ✅
サーバーへの GET リクエスト送信を廃止し、クライアントサイドで動的に表示を切り替える。
1. **`src/components/records/record-filters.tsx` [MODIFY]** の変更
   - フォームの `onSubmit` のデフォルト動作を抑止。props 経由で親コンポーネント（`TimelineContainer`）のステート更新ハンドラーと接続。
2. **パフォーマンス向上とリアルタイム性確保**:
   - 検索キーワードに 300ms デバウンスを適用。
   - 絞り込み結果に応じて `Timeline` および `RecordStats` (分析統計) が 0ms で同期更新されるように変更。

### Step 4: 動作検証とパフォーマンス測定 ✅
1. 検索キーワード入力、種別・カテゴリ変更でページリロードが一切発生せず、超高速にフィルタリングされることを検証。
2. フィルタ変更時に URL が追従し、その URL でリロードした際にもフィルタ状態が正しく復元されることを検証。
