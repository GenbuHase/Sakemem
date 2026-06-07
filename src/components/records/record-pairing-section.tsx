"use client";

import { useActionState } from "react";
import {
  linkRecordPair,
  unlinkRecordPair,
  type RecordActionState,
} from "@/app/actions/records";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Select } from "@/components/ui/inputs";
import { SectionCard } from "@/components/ui/section-card";
import { getCategoryLabel } from "@/lib/constants/categories";
import type { SakememRecord } from "@/lib/types/record";
import { formatRecordDate } from "@/lib/utils/date";

const initialState: RecordActionState | null = null;

type RecordPairingSectionProps = {
  record: SakememRecord;
  partners: SakememRecord[];
  linkCandidates: SakememRecord[];
};

function formatCandidateLabel(candidate: SakememRecord): string {
  return `${formatRecordDate(candidate.date)} / ${getCategoryLabel(candidate.category)} / ${candidate.name}`;
}

export function RecordPairingSection({
  record,
  partners,
  linkCandidates,
}: RecordPairingSectionProps) {
  const [unlinkState, unlinkAction, unlinking] = useActionState(
    unlinkRecordPair,
    initialState,
  );
  const [linkState, linkAction, linking] = useActionState(
    linkRecordPair,
    initialState,
  );

  const pending = unlinking || linking;
  const lastError = unlinkState?.error ?? linkState?.error;
  const lastSuccess =
    (unlinkState && !unlinkState.error) || (linkState && !linkState.error);

  return (
    <SectionCard
      variant="muted"
      title="ペアリング"
      description="お酒とおつまみを後からペアにしたり、複数の記録をまとめてペアにできます。"
    >
      <div className="space-y-4">
        <PartnersList
          partners={partners}
          recordId={record.id}
          formAction={unlinkAction}
          pending={pending}
        />

        <LinkForm
          partnersExist={partners.length > 0}
          candidates={linkCandidates}
          recordId={record.id}
          formAction={linkAction}
          pending={pending}
        />
      </div>

      {lastError ? (
        <FormMessage variant="error" className="mt-4">
          {lastError}
        </FormMessage>
      ) : null}

      {!lastError && lastSuccess ? (
        <FormMessage variant="success" className="mt-4">
          ペアリングを更新しました。
        </FormMessage>
      ) : null}
    </SectionCard>
  );
}

type PartnersListProps = {
  partners: SakememRecord[];
  recordId: string;
  formAction: (formData: FormData) => void;
  pending: boolean;
};

function PartnersList({
  partners,
  recordId,
  formAction,
  pending,
}: PartnersListProps) {
  if (partners.length === 0) {
    return (
      <p className="text-sm text-zinc-600">現在はペアリングされていません。</p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-zinc-700">現在のペア</p>
      <ul className="space-y-2">
        {partners.map((partner) => (
          <li
            key={partner.id}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-700"
          >
            {formatCandidateLabel(partner)}
          </li>
        ))}
      </ul>

      <form action={formAction}>
        <input type="hidden" name="id" value={recordId} />
        <Button type="submit" variant="secondary" size="sm" disabled={pending}>
          {pending ? "処理中..." : "この記録をペアから外す"}
        </Button>
      </form>
    </div>
  );
}

type LinkFormProps = {
  partnersExist: boolean;
  candidates: SakememRecord[];
  recordId: string;
  formAction: (formData: FormData) => void;
  pending: boolean;
};

function LinkForm({
  partnersExist,
  candidates,
  recordId,
  formAction,
  pending,
}: LinkFormProps) {
  if (candidates.length === 0) {
    if (partnersExist) return null;
    return (
      <p className="text-sm text-zinc-500">
        ペアにできる記録がありません。
      </p>
    );
  }

  const labelText = partnersExist ? "ペアに追加する記録" : "ペアにする記録";
  const buttonText = partnersExist ? "ペアに追加" : "ペアにする";

  return (
    <form action={formAction} className="space-y-3 border-t border-zinc-200 pt-4">
      <input type="hidden" name="id" value={recordId} />

      <Select
        id="partner_id"
        name="partner_id"
        label={labelText}
        required
        defaultValue=""
      >
        <option value="" disabled>
          記録を選択
        </option>
        {candidates.map((candidate) => (
          <option key={candidate.id} value={candidate.id}>
            {formatCandidateLabel(candidate)}
          </option>
        ))}
      </Select>

      <Button type="submit" disabled={pending}>
        {pending ? "処理中..." : buttonText}
      </Button>
    </form>
  );
}
