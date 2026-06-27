export default function NewRecordLoading() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      {/* ページヘッダーのスケルトン */}
      <div className="mb-6 space-y-2">
        <div className="h-4.5 w-32 animate-pulse rounded bg-zinc-200" />
        <div className="h-8 w-40 animate-pulse rounded-lg bg-zinc-200" />
        <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200" />
      </div>

      <div className="space-y-6">
        {/* 基本情報のスケルトン */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4">
          <div className="h-5.5 w-24 animate-pulse rounded bg-zinc-200" />
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="h-4.5 w-12 animate-pulse rounded bg-zinc-200" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-200" />
            </div>
            <div className="space-y-2">
              <div className="h-4.5 w-12 animate-pulse rounded bg-zinc-200" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-200" />
            </div>
          </div>
        </div>

        {/* 記録フォームのスケルトン */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-4">
          <div className="h-5.5 w-12 animate-pulse rounded bg-zinc-200" />
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <div className="h-4.5 w-16 animate-pulse rounded bg-zinc-200" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-200" />
            </div>
            <div className="space-y-2">
              <div className="h-4.5 w-12 animate-pulse rounded bg-zinc-200" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-200" />
            </div>
            <div className="space-y-2">
              <div className="h-4.5 w-24 animate-pulse rounded bg-zinc-200" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-200" />
            </div>
            {/* レーティング */}
            <div className="space-y-2 py-2">
              <div className="h-4.5 w-16 animate-pulse rounded bg-zinc-200" />
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-7 w-7 animate-pulse rounded bg-zinc-200" />
                ))}
              </div>
            </div>
            {/* コメント */}
            <div className="space-y-2">
              <div className="h-4.5 w-12 animate-pulse rounded bg-zinc-200" />
              <div className="h-24 w-full animate-pulse rounded-lg bg-zinc-200" />
            </div>
          </div>
        </div>

        {/* 保存ボタン */}
        <div className="h-12 w-full animate-pulse rounded-lg bg-zinc-200" />
      </div>
    </div>
  );
}
