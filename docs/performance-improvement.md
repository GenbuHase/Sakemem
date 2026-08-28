# パフォーマンス改善

最終更新: 2026-08-28

## 結論

Sakemem は、公開ページだけ SSR を維持するハイブリッド構成へ移行した。

- `/profile/[username]`、共有記録、OGP は SEO・共有プレビューのため SSR を維持する。
- ホーム、ログイン、登録、タイムライン、新規作成、設定、オンボーディング、更新情報は静的シェルにする。
- 認証、プロフィール、記録の読取は Supabase ブラウザクライアントと RLS を利用する。
- 書込は Server Action で再認証し、結果をクライアントキャッシュへ即時反映する。
- Proxy は `/@username` の内部 rewrite だけを担当する。

## 変更前の実測

ローカルの `next build` と `next start`、ログイン済みブラウザで測定した。

- アイコンと manifest 以外の画面はすべて動的 SSR だった。
- ホームの初回 navigation は `responseStart` 約 2.72 秒、`load` 約 3.98 秒だった。
- ホームからタイムラインへ移動すると、`/records` の RSC が約 46.7 KiB、約 1.14 秒かかった。
- ホーム上の prefetch でも `/records` と `/records/new` の RSC が発生していた。
- Proxy、共通 Header、各ページから Supabase Auth とプロフィール・記録を重複取得していた。
- `/records` は `requireUser` の後に、内部でも再度 `requireUser` を行う読取を直列実行していた。
- Service Worker の事前キャッシュは 38 エントリ、約 881.51 KiB だった。

## 変更後の実測

同じローカル本番構成で確認した。ブラウザキャッシュの状態に左右されるため、絶対値ではなく通信経路の変化を主な回帰基準とする。

- ホーム、認証画面、`/records`、`/records/new`、設定、オンボーディング、更新情報は静的生成になった。
- ホームの navigation は `responseStart` 約 75 ms、`load` 約 174 ms だった。
- ホームから `/records` へのクリック時に動的 RSC は発生せず、記録の Supabase REST 取得だけが1回発生した。
  - 実データ80件で約 42.5 KiB、約 602 ms。
- `/records` から `/records/new` は追加 JavaScript 約 21.3 KiBだけで、RSC・Auth・DB通信は発生しなかった。
- `/records/new` から `/records` に戻る遷移は追加通信0件だった。
- `/records/[id]/edit` はタイムラインからの通常操作では History API と同じ記録キャッシュを使い、RSC・DB通信なしで表示する。
  - 直リンク時だけ、動的ルートの静的シェルをサーバーから受け取り、ブラウザで記録を1回取得する。
- ホームの表示はプロフィール取得を待たない。プロフィール REST が遅い場合でも、静的シェルと主要操作は先に表示される。
- Service Worker の事前キャッシュは45エントリ、約 1.12 MiBになった。Supabase ブラウザSDKとCSR画面の追加による増加で、認証後の再遷移時のサーバー往復削減とのトレードオフである。

## 最終アーキテクチャ

### 認証と共通シェル

- Root Layout は Service Worker と `AuthProvider` だけを配置する。
- `(site)`、`(app)`、公開プロフィールのレイアウトで、それぞれ必要な Header を表示する。
- `AuthProvider` は `getSession` と `onAuthStateChange` でブラウザ表示用の状態を管理する。
- 認証済み画面のガードはクライアントで行い、未認証時は `next` 付きで `/login` へ移動する。
- RLS と Server Action 内の `auth.getUser()` はセキュリティ境界として維持する。

### 記録とプロフィールの読取

- Profile Context と Records Context を分離し、プロフィール更新でタイムライン全体を再取得しない。
- Records Context は同時リクエストを集約し、セッション中の取得結果を再利用する。
- 通信中の取得結果より新しいローカル更新を優先し、遅れて完了した読取で作成・更新結果を巻き戻さない。
- `/records/new` へ直接アクセスした場合は、作成後に全件を一度取得してから新規結果を upsert し、部分キャッシュを全件キャッシュとして扱わない。
- 編集対象、ペア、ペア候補は全件キャッシュから導出する。
- ログアウトやユーザー切替時は Records Provider を再生成し、別ユーザーのデータを保持しない。
- タイムラインの絞り込み、集計、グルーピングはメモ化する。
- 各タイムライン項目に `content-visibility: auto` を適用し、長い一覧のレイアウト・描画負荷を抑える。

### 更新処理

- 作成・更新・削除・ペアリング・プロフィール保存は Server Action で再認証する。
- Server Action は `redirect` やプライベート画面の `revalidatePath` を行わず、変更後のレコードまたは整合済みスナップショットを返す。
- 作成・更新はクライアントキャッシュへ upsert し、削除は先に楽観反映する。失敗時は削除対象だけを戻し、同時に発生した別の更新を古い全件スナップショットで上書きしない。
- ペアリングはサーバーで複数行の整合性を確保した後、返されたスナップショットで置換する。
- 公開プロフィール本文・共有記録・OGP の再検証は `after` で応答後に行い、Server Action の結果を反映するクライアントUIを再描画しない。
- ログイン、登録、ログアウト、ユーザー名確認はブラウザSupabaseへ移した。
- Avatar の圧縮・WebP変換とStorage更新は Sharp が必要なため Server Action に残した。

### 公開SSR

- Cookie を読まない匿名 Supabase クライアントを公開ページ専用に使用する。
- React `cache` のローダーで `generateMetadata` と本文の同一RPCをリクエスト内で共有する。
- プロフィールと公開記録は並列取得する。
- 公開RPCのユーザー名比較は大文字小文字を無視した完全一致とし、`_` をSQLワイルドカードとして扱わない。
- 公開記録RPCは所有者のAuth UUIDを返さず、`hide_place_when_shared` が有効な場所をSQL側でも `NULL` にする。
- OGP画像でも同じローダーを利用し、フォントとAvatarを並列取得する。フォントはプロセス内で再利用する。
- OGP用Avatarは設定中のSupabase `profile-images` 公開バケットだけを許可し、5秒・2 MiB・画像MIMEの上限を設ける。
- Next.js 16.3.3、`@vercel/og` 1.0.2、Sharp 0.35.4へ更新し、OGP処理でSharpが二重ロードされない構成にした。
- 実測では、公開プロフィール本文はSSRを維持し、プロフィールOGPは約 96.7 KiB、共有記録OGPは約 51.9 KiBの PNG を正常に返した。

### Proxy と Service Worker

- Proxy の matcher は `/@:username/:path*` だけで、DB・Authへアクセスしない。
- Supabase の Auth、REST、GraphQL、Functions は `NetworkOnly` とする。
- `/records`、設定、オンボーディング、Auth callback、アプリAPIも `NetworkOnly` とする。
- v4移行時に旧 `pages`、RSC、cross-origin、`others` キャッシュを一度破棄する。
- Cache Storage を検査し、認証ルートのHTML/RSCとSupabase Auth・RESTのURLが保存されていないことを確認した。認証画面を巡回した後に残ったRSCキャッシュは公開ホームだけだった。
- `/~offline` は事前キャッシュされ、実際に本番サーバーを停止した状態でも未キャッシュURLからオフライン画面へフォールバックした。

## 回帰検証

以下を完了条件とする。

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
```

- 単体テスト: 18ファイル、70件。
- 静的シェルの直接表示とクライアント遷移。
- 記録キャッシュの再利用、作成・更新・削除結果の即時反映。
- 公開プロフィール・共有記録のSSR本文とOGメタデータ。
- プロフィール・共有記録のOGP画像。
- Service Worker のNetworkOnlyルールとオフラインフォールバック。
- 公開RPC migrationの完全一致、場所マスク、Auth UUID非公開をリモートDBで確認。
- 本番依存の `npm audit --omit=dev`: 既知の脆弱性0件。

## 今後の監視点

- 記録80件では REST payload が約 42.5 KiBだった。数百件規模になった場合は、期間単位のページングまたは仮想リストを追加する。
- 公開プロフィールは全公開記録をSSRするため、公開件数が大きくなった場合はページングを検討する。
- CSR化で初回JavaScriptは増える。実ユーザー指標では LCP、INP、ルート遷移時間、Supabase REST の p95 を継続監視する。
