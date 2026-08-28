"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo } from "react";
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

type EditRecordPageContentProps = {
  recordId?: string;
};

export function EditRecordPageContent({
  recordId,
}: EditRecordPageContentProps = {}) {
  const params = useParams<{ id?: string }>();
  const id = recordId ?? params.id ?? "";
  const { status, records, error, loadRecords } = useRecords();
  const context = useMemo(() => {
    const record = records.find((candidate) => candidate.id === id) ?? null;
    if (!record) return null;

    return {
      record,
      partners: getPartners(records, record),
      linkCandidates: filterLinkCandidates(records, record),
    };
  }, [id, records]);

  useEffect(() => {
    void loadRecords().catch(() => undefined);
  }, [loadRecords]);

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
