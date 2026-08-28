export default function EditRecordLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      {/* ページヘッダー of skeleton */}
      <div className="mb-6 space-y-2">
        <div className="h-4.5 w-32 animate-pulse rounded bg-zinc-200" />
        <div className="h-8 w-40 animate-pulse rounded-lg bg-zinc-200" />
      </div>

      <div className="space-y-6">
        {/* 基本情報と編集フォームのスケルトン */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4">
          <div className="h-5.5 w-24 animate-pulse rounded bg-zinc-200" />
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="h-4.5 w-12 animate-pulse rounded bg-zinc-200" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-200" />
            </div>
            <div className="space-y-2">
              <div className="h-4.5 w-16 animate-pulse rounded bg-zinc-200" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-200" />
            </div>
            <div className="space-y-2">
              <div className="h-4.5 w-12 animate-pulse rounded bg-zinc-200" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-200" />
            </div>
            {/* コメント */}
            <div className="space-y-2">
              <div className="h-4.5 w-12 animate-pulse rounded bg-zinc-200" />
              <div className="h-24 w-full animate-pulse rounded-lg bg-zinc-200" />
            </div>
          </div>
        </div>

        {/* ペアリングセクションのスケルトン */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4">
          <div className="h-5.5 w-28 animate-pulse rounded bg-zinc-200" />
          <div className="space-y-3 pt-2">
            <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />
            <div className="h-20 w-full animate-pulse rounded-lg bg-zinc-200" />
          </div>
        </div>

        {/* 削除ボタン・保存ボタンエリア */}
        <div className="flex gap-3">
          <div className="h-12 w-28 animate-pulse rounded-lg bg-zinc-200" />
          <div className="h-12 flex-1 animate-pulse rounded-lg bg-zinc-200" />
        </div>
      </div>
    </div>
  );
}
