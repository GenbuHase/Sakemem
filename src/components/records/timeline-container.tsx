"use client";

import { useEffect, useMemo, useState } from "react";
import { RecordFiltersForm } from "@/components/records/record-filters";
import { RecordStats } from "@/components/records/record-stats";
import { Timeline } from "@/components/records/timeline";
import {
  filterRecords,
  hasActiveFilters,
  type RecordFilters,
  type RecordKindFilter,
} from "@/lib/records/filter-records";
import { groupRecordsForTimeline } from "@/lib/records/group-timeline";
import { analyzeRecords } from "@/lib/records/analyze-records";
import type { RecordCategory, SakememRecord } from "@/lib/types/record";

type TimelineContainerProps = {
  allRecords: SakememRecord[];
  initialFilters: RecordFilters;
  shareUsername?: string | null;
};

export function TimelineContainer({
  allRecords,
  initialFilters,
  shareUsername = null,
}: TimelineContainerProps) {
  // 状態管理
  const [query, setQuery] = useState(initialFilters.query ?? "");
  const [kind, setKind] = useState<RecordKindFilter>(
    initialFilters.kind ?? "all",
  );
  const [category, setCategory] = useState<RecordCategory | "">(
    initialFilters.category ?? "",
  );

  // デバウンスされた検索キーワード
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  // 検索キーワードのデバウンス処理（300ms）
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // フィルタ状態が変化した際に URL クエリパラメータを同期（Next.js の再描画を伴わない）
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (kind && kind !== "all") params.set("kind", kind);
    if (category) params.set("category", category);

    const queryString = params.toString();
    const newUrl = queryString ? `/records?${queryString}` : "/records";

    window.history.replaceState(null, "", newUrl);
  }, [query, kind, category]);

  // クライアントサイドでのリアルタイム・フィルタリングと統計の計算
  const activeFilters = useMemo<RecordFilters>(
    () => ({
      query: debouncedQuery,
      kind,
      category: category || undefined,
    }),
    [category, debouncedQuery, kind],
  );

  const { filteredRecords, entries, analysis, isFiltered } = useMemo(() => {
    const nextFilteredRecords = filterRecords(allRecords, activeFilters);
    return {
      filteredRecords: nextFilteredRecords,
      entries: groupRecordsForTimeline(nextFilteredRecords),
      analysis: analyzeRecords(nextFilteredRecords),
      isFiltered: hasActiveFilters(activeFilters),
    };
  }, [activeFilters, allRecords]);

  // フィルタクリア処理
  const handleClear = () => {
    setQuery("");
    setKind("all");
    setCategory("");
  };

  return (
    <div className="space-y-6">
      <RecordFiltersForm
        query={query}
        kind={kind}
        category={category}
        onQueryChange={setQuery}
        onKindChange={setKind}
        onCategoryChange={setCategory}
        onClear={handleClear}
      />

      <RecordStats analysis={analysis} />

      {isFiltered ? (
        <p className="text-sm text-zinc-500">
          {filteredRecords.length}件の記録が見つかりました
        </p>
      ) : null}

      <Timeline
        entries={entries}
        filtered={isFiltered}
        shareUsername={shareUsername}
      />
    </div>
  );
}
