"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useRecords } from "@/components/providers/records-provider";
import { EditRecordForm } from "@/components/records/edit-record-form";
import { RecordPairingSection } from "@/components/records/record-pairing-section";
import { LinkButton } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { PageHeader } from "@/components/ui/page-header";
import {
  filterLinkCandidates,
  getPartners,
} from "@/lib/records/pairing";
import {
  fetchRecordById,
  fetchRecordsByPairId,
  fetchUnpairedOppositeRecords,
} from "@/lib/records/repository";
import { createClient } from "@/lib/supabase/client";
import type { SakememRecord } from "@/lib/types/record";

type EditRecordPageContentProps = {
  recordId?: string;
};

export function EditRecordPageContent({
  recordId,
}: EditRecordPageContentProps = {}) {
  const params = useParams<{ id?: string }>();
  const id = recordId ?? params.id ?? "";
  const { status, records, error, loadRecords } = useRecords();
  const [resolvedRecords, setResolvedRecords] = useState<SakememRecord[]>([]);
  const cachedRecord = records.find((candidate) => candidate.id === id) ?? null;
  const context = useMemo(() => {
    const availableRecords = [...records, ...resolvedRecords];
    const record = availableRecords.find((candidate) => candidate.id === id) ?? null;
    if (!record) return null;

    return {
      record,
      partners: getPartners(availableRecords, record),
      linkCandidates: filterLinkCandidates(availableRecords, record),
    };
  }, [id, records, resolvedRecords]);

  useEffect(() => {
    void loadRecords().catch(() => undefined);
  }, [loadRecords]);

  useEffect(() => {
    if (status !== "ready" || !id) {
      return;
    }

    let active = true;
    const supabase = createClient();
    void Promise.resolve(cachedRecord ?? fetchRecordById(supabase, id))
      .then(async (record) => {
        if (!record || !active) return;
        const [partners, candidates] = await Promise.all([
          record.pair_id
            ? fetchRecordsByPairId(supabase, record.pair_id)
            : Promise.resolve([]),
          fetchUnpairedOppositeRecords(supabase, record.category),
        ]);
        if (active) {
          setResolvedRecords([record, ...partners, ...candidates]);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [cachedRecord, id, status]);

  if (status === "idle" || status === "loading") {
    return <EditRecordPageSkeleton />;
  }

  if (status === "error") {
    return (
      <div className="mx-auto w-full max-w-2xl space-y-4 px-4 py-8 sm:px-6 sm:py-10">
        <FormMessage variant="error">
          {error ?? "記録の取得に失敗しました。"}
        </FormMessage>
        <button
          type="button"
          className="text-sm font-medium text-zinc-700 underline"
          onClick={() => void loadRecords({ force: true })}
        >
          再試行する
        </button>
      </div>
    );
  }

  if (!context) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-xl font-semibold text-zinc-900">
          記録が見つかりません
        </h1>
        <div className="mt-6">
          <LinkButton href="/records">タイムラインに戻る</LinkButton>
        </div>
      </div>
    );
  }

  const { record, partners, linkCandidates } = context;

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        backHref="/records"
        backLabel="タイムラインに戻る"
        title="記録を編集"
      />

      <div className="space-y-6">
        <EditRecordForm record={record} />
        <RecordPairingSection
          record={record}
          partners={partners}
          linkCandidates={linkCandidates}
        />
      </div>
    </div>
  );
}

export function EditRecordPageSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10"
      aria-busy="true"
      aria-label="記録を読み込んでいます"
    >
      <div className="mb-6 space-y-2">
        <div className="h-4 w-32 animate-pulse rounded bg-zinc-100" />
        <div className="h-8 w-40 animate-pulse rounded bg-zinc-200" />
      </div>
      <div className="space-y-6">
        <div className="h-96 animate-pulse rounded-xl bg-zinc-100" />
        <div className="h-48 animate-pulse rounded-xl bg-zinc-100" />
      </div>
    </div>
  );
}
