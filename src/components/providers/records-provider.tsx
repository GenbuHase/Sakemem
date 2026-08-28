"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  removeCachedRecords,
  sortCachedRecords,
  upsertCachedRecords,
} from "@/lib/records/client-cache";
import {
  fetchRecordsPage,
  type RecordsCursor,
} from "@/lib/records/repository";
import { createClient } from "@/lib/supabase/client";
import type { SakememRecord } from "@/lib/types/record";
import { useAuth } from "./auth-provider";

type RecordsStatus = "idle" | "loading" | "ready" | "error";

type RecordsContextValue = {
  status: RecordsStatus;
  records: SakememRecord[];
  error: string | null;
  loadRecords(options?: { force?: boolean }): Promise<SakememRecord[]>;
  loadMoreRecords(): Promise<SakememRecord[]>;
  hasMore: boolean;
  loadingMore: boolean;
  replaceRecords(records: SakememRecord[]): void;
  upsertRecords(records: SakememRecord[]): void;
  removeRecords(ids: string[]): SakememRecord[];
};

const RecordsContext = createContext<RecordsContextValue | null>(null);

export function RecordsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [supabase] = useState(createClient);
  const [status, setStatus] = useState<RecordsStatus>("idle");
  const [records, setRecords] = useState<SakememRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const statusRef = useRef<RecordsStatus>("idle");
  const recordsRef = useRef<SakememRecord[]>([]);
  const nextCursorRef = useRef<RecordsCursor | null>(null);
  const loadPromiseRef = useRef<Promise<SakememRecord[]> | null>(null);
  const loadMorePromiseRef = useRef<Promise<SakememRecord[]> | null>(null);
  const requestGenerationRef = useRef(0);

  const commitRecords = useCallback((nextRecords: SakememRecord[]) => {
    requestGenerationRef.current += 1;
    const sorted = sortCachedRecords(nextRecords);
    recordsRef.current = sorted;
    statusRef.current = "ready";
    setRecords(sorted);
    setStatus("ready");
    setError(null);
  }, []);

  const loadRecords = useCallback(
    async ({ force = false }: { force?: boolean } = {}) => {
      if (!user) {
        return [];
      }

      if (!force && statusRef.current === "ready") {
        return recordsRef.current;
      }
      if (!force && loadPromiseRef.current) {
        return loadPromiseRef.current;
      }

      statusRef.current = "loading";
      setStatus("loading");
      setError(null);
      const requestGeneration = requestGenerationRef.current + 1;
      requestGenerationRef.current = requestGeneration;

      const request = fetchRecordsPage(supabase)
        .then((nextRecords) => {
          if (requestGenerationRef.current !== requestGeneration) {
            return recordsRef.current;
          }
          nextCursorRef.current = nextRecords.nextCursor;
          setHasMore(nextRecords.hasMore);
          commitRecords(nextRecords.records);
          return nextRecords.records;
        })
        .catch((cause: unknown) => {
          if (requestGenerationRef.current !== requestGeneration) {
            return recordsRef.current;
          }
          const message =
            cause instanceof Error
              ? cause.message
              : "記録の取得に失敗しました。";
          statusRef.current = "error";
          setStatus("error");
          setError(message);
          throw cause;
        })
        .finally(() => {
          if (loadPromiseRef.current === request) {
            loadPromiseRef.current = null;
          }
        });
      loadPromiseRef.current = request;
      return request;
    },
    [commitRecords, supabase, user],
  );

  const loadMoreRecords = useCallback(() => {
    if (!user || !nextCursorRef.current || !hasMore) {
      return Promise.resolve(recordsRef.current);
    }

    if (loadMorePromiseRef.current) {
      return loadMorePromiseRef.current;
    }

    const requestGeneration = requestGenerationRef.current;
    setLoadingMore(true);
    const request = fetchRecordsPage(supabase, { cursor: nextCursorRef.current })
      .then((nextPage) => {
        if (requestGenerationRef.current !== requestGeneration) {
          return recordsRef.current;
        }
        nextCursorRef.current = nextPage.nextCursor;
        setHasMore(nextPage.hasMore);
        const merged = upsertCachedRecords(recordsRef.current, nextPage.records);
        commitRecords(merged);
        return merged;
      })
      .catch((cause: unknown) => {
        const message =
          cause instanceof Error ? cause.message : "記録の取得に失敗しました。";
        setError(message);
        throw cause;
      })
      .finally(() => {
        loadMorePromiseRef.current = null;
        setLoadingMore(false);
      });

    loadMorePromiseRef.current = request;
    return request;
  }, [commitRecords, hasMore, supabase, user]);

  const upsertRecords = useCallback(
    (nextRecords: SakememRecord[]) => {
      commitRecords(upsertCachedRecords(recordsRef.current, nextRecords));
    },
    [commitRecords],
  );

  const removeRecords = useCallback(
    (ids: string[]) => {
      const idSet = new Set(ids);
      const removedRecords = recordsRef.current.filter((record) =>
        idSet.has(record.id),
      );
      commitRecords(removeCachedRecords(recordsRef.current, ids));
      return removedRecords;
    },
    [commitRecords],
  );

  const value = useMemo<RecordsContextValue>(
    () => ({
      status,
      records,
      error,
      loadRecords,
      loadMoreRecords,
      hasMore,
      loadingMore,
      replaceRecords: commitRecords,
      upsertRecords,
      removeRecords,
    }),
    [
      commitRecords,
      error,
      hasMore,
      loadRecords,
      loadMoreRecords,
      loadingMore,
      records,
      removeRecords,
      status,
      upsertRecords,
    ],
  );

  return <RecordsContext value={value}>{children}</RecordsContext>;
}

export function useRecords(): RecordsContextValue {
  const value = useContext(RecordsContext);
  if (!value) {
    throw new Error("useRecords must be used within RecordsProvider");
  }
  return value;
}
