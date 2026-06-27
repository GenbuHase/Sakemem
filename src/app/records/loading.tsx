export default function RecordsLoading() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      {/* ページヘッダーのスケルトン */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded-lg bg-zinc-200" />
          <div className="h-4 w-64 animate-pulse rounded-lg bg-zinc-200" />
        </div>
        <div className="h-10 w-24 animate-pulse rounded-lg bg-zinc-200" />
      </div>

      <div className="space-y-6">
        {/* フィルターフォームのスケルトン */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[12rem] flex-1 space-y-2">
              <div className="h-4.5 w-16 animate-pulse rounded bg-zinc-200" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-200" />
            </div>
            <div className="w-full sm:w-40 space-y-2">
              <div className="h-4.5 w-12 animate-pulse rounded bg-zinc-200" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-200" />
            </div>
            <div className="w-full sm:w-44 space-y-2">
              <div className="h-4.5 w-16 animate-pulse rounded bg-zinc-200" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-200" />
            </div>
            <div className="h-10 w-full animate-pulse rounded-lg bg-zinc-200 sm:w-16" />
          </div>
        </div>

        {/* 統計情報のスケルトン */}
        <div className="rounded-xl border border-zinc-200 bg-white p-6">
          <div className="h-5 w-12 animate-pulse rounded bg-zinc-200" />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg bg-zinc-50 px-3 py-2.5 space-y-2">
                <div className="h-3.5 w-12 animate-pulse rounded bg-zinc-200" />
                <div className="h-7 w-8 animate-pulse rounded bg-zinc-200" />
              </div>
            ))}
          </div>
        </div>

        {/* タイムラインのスケルトン */}
        <div className="space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 w-28 animate-pulse rounded bg-zinc-200" />
              <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-5 w-40 animate-pulse rounded bg-zinc-200" />
                    <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
                  </div>
                  <div className="h-6 w-16 animate-pulse rounded-full bg-zinc-200" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-zinc-200" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-zinc-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
