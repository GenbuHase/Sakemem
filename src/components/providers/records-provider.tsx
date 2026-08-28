"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { createClientDataLoader } from "@/lib/client-data-loader";
import {
  removeCachedRecords,
  sortCachedRecords,
  upsertCachedRecords,
} from "@/lib/records/client-cache";
import { fetchAllRecords } from "@/lib/records/repository";
import { createClient } from "@/lib/supabase/client";
import type { SakememRecord } from "@/lib/types/record";
import { useAuth } from "./auth-provider";

type RecordsStatus = "idle" | "loading" | "ready" | "error";

type RecordsContextValue = {
  status: RecordsStatus;
  records: SakememRecord[];
  error: string | null;
  loadRecords(options?: { force?: boolean }): Promise<SakememRecord[]>;
  replaceRecords(records: SakememRecord[]): void;
  upsertRecords(records: SakememRecord[]): void;
  removeRecords(ids: string[]): SakememRecord[];
};

const RecordsContext = createContext<RecordsContextValue | null>(null);

export function RecordsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [supabase] = useState(createClient);
  const [loader] = useState(() =>
    createClientDataLoader(() => fetchAllRecords(supabase)),
  );
  const [status, setStatus] = useState<RecordsStatus>("idle");
  const [records, setRecords] = useState<SakememRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const statusRef = useRef<RecordsStatus>("idle");
  const recordsRef = useRef<SakememRecord[]>([]);
  const requestGenerationRef = useRef(0);

  const commitRecords = useCallback((nextRecords: SakememRecord[]) => {
    requestGenerationRef.current += 1;
    const sorted = sortCachedRecords(nextRecords);
    loader.prime(sorted);
    recordsRef.current = sorted;
    statusRef.current = "ready";
    setRecords(sorted);
    setStatus("ready");
    setError(null);
  }, [loader]);

  const loadRecords = useCallback(
    async ({ force = false }: { force?: boolean } = {}) => {
      if (!user) {
        return [];
      }

      if (!force && statusRef.current === "ready") {
        return recordsRef.current;
      }

      statusRef.current = "loading";
      setStatus("loading");
      setError(null);
      const requestGeneration = requestGenerationRef.current + 1;
      requestGenerationRef.current = requestGeneration;

      return loader
        .load({ force })
        .then((nextRecords) => {
          if (requestGenerationRef.current !== requestGeneration) {
            return recordsRef.current;
          }
          commitRecords(nextRecords);
          return nextRecords;
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
        });
    },
    [commitRecords, loader, user],
  );

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
      replaceRecords: commitRecords,
      upsertRecords,
      removeRecords,
    }),
    [
      commitRecords,
      error,
      loadRecords,
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
