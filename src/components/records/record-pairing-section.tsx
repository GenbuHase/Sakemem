"use client";

import { useActionState, useState } from "react";
import {
  linkRecordPair,
  unlinkRecordPair,
  type RecordActionState,
} from "@/app/actions/records";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { SectionCard } from "@/components/ui/section-card";
import { cx } from "@/components/ui/styles";
import { getCategoryLabel, isFoodCategory } from "@/lib/constants/categories";
import type { SakememRecord } from "@/lib/types/record";
import { formatRecordDate } from "@/lib/utils/date";
import { RatingDisplay } from "./rating-display";

const initialState: RecordActionState | null = null;

type RecordPairingSectionProps = {
  record: SakememRecord;
  partners: SakememRecord[];
  linkCandidates: SakememRecord[];
};

function getCategoryAccent(category: SakememRecord["category"]) {
  if (isFoodCategory(category)) {
    return {
      badge: "bg-emerald-100 text-emerald-800",
      card: "border-emerald-200/80 bg-emerald-50/40",
      selected: "border-emerald-500 ring-2 ring-emerald-200",
    };
  }

  return {
    badge: "bg-amber-100 text-amber-900",
    card: "border-amber-200/80 bg-amber-50/40",
    selected: "border-amber-500 ring-2 ring-amber-200",
  };
}

type PairingRecordCardProps = {
  record: SakememRecord;
  current?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
};

function PairingRecordCard({
  record,
  current = false,
  selectable = false,
  selected = false,
  onSelect,
}: PairingRecordCardProps) {
  const accent = getCategoryAccent(record.category);

  const content = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span
          className={cx(
            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
            accent.badge,
          )}
        >
          {getCategoryLabel(record.category)}
        </span>
        {current ? (
          <span className="shrink-0 rounded-full bg-zinc-900 px-2 py-0.5 text-[10px] font-medium text-white">
            この記録
          </span>
        ) : null}
        {selectable && selected ? (
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white"
            aria-hidden
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              className="h-3 w-3"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
            </svg>
          </span>
        ) : null}
      </div>

      <p className="mt-2 truncate text-sm font-semibold text-zinc-900">
        {record.name}
      </p>

      {record.producer ? (
        <p className="mt-0.5 truncate text-xs text-zinc-500">{record.producer}</p>
      ) : record.sub_info ? (
        <p className="mt-0.5 truncate text-xs text-zinc-500">{record.sub_info}</p>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-zinc-200/80 pt-2">
        <time
          dateTime={record.date}
          className="text-xs text-zinc-500"
        >
          {formatRecordDate(record.date)}
        </time>
        <RatingDisplay rating={record.rating} />
      </div>
    </>
  );

  if (selectable) {
    return (
      <button
        type="button"
        onClick={onSelect}
        className={cx(
          "w-full rounded-lg border p-3 text-left transition",
          accent.card,
          selected
            ? accent.selected
            : "hover:border-zinc-300 hover:shadow-sm",
        )}
        aria-pressed={selected}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={cx(
        "rounded-lg border p-3",
        accent.card,
        current && "ring-2 ring-zinc-900/10",
      )}
    >
      {content}
    </div>
  );
}

function PairConnector() {
  return (
    <div
      className="hidden items-center justify-center self-center sm:flex"
      aria-hidden
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-400 shadow-sm">
        <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" stroke="currentColor" strokeWidth="1.5">
          <path
            d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

function EmptyPairingState({
  message,
  hint,
}: {
  message: string;
  hint?: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-zinc-300 bg-white px-4 py-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.5">
          <path
            d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="mt-3 text-sm font-medium text-zinc-700">{message}</p>
      {hint ? (
        <p className="mt-1 max-w-xs text-xs text-zinc-500">{hint}</p>
      ) : null}
    </div>
  );
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

  const drinks = [record, ...partners].filter((r) => !isFoodCategory(r.category));
  const foods = [record, ...partners].filter((r) => isFoodCategory(r.category));
  const isPaired = partners.length > 0;

  return (
    <SectionCard
      variant="muted"
      title="ペアリング"
      description="お酒とおつまみを後からペアにしたり、複数の記録をまとめてペアにできます。"
    >
      <div className="space-y-5">
        {isPaired ? (
          <CurrentPairGroup
            drinks={drinks}
            foods={foods}
            currentId={record.id}
            recordId={record.id}
            formAction={unlinkAction}
            pending={pending}
          />
        ) : linkCandidates.length > 0 ? (
          <EmptyPairingState
            message="まだペアリングされていません"
            hint="下の候補から選んで、お酒とおつまみをペアにできます"
          />
        ) : null}

        <LinkForm
          partnersExist={isPaired}
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

type CurrentPairGroupProps = {
  drinks: SakememRecord[];
  foods: SakememRecord[];
  currentId: string;
  recordId: string;
  formAction: (formData: FormData) => void;
  pending: boolean;
};

function CurrentPairGroup({
  drinks,
  foods,
  currentId,
  recordId,
  formAction,
  pending,
}: CurrentPairGroupProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-4 py-2.5">
        <span className="inline-flex items-center rounded-full bg-zinc-900 px-2.5 py-0.5 text-xs font-medium text-white">
          ペア
        </span>
        <span className="text-xs text-zinc-500">
          お酒 {drinks.length} · おつまみ {foods.length}
        </span>
      </div>

      <div className="space-y-3 p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-800/70">
              お酒
            </p>
            {drinks.map((drink) => (
              <PairingRecordCard
                key={drink.id}
                record={drink}
                current={drink.id === currentId}
              />
            ))}
          </div>

          <PairConnector />

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-800/70">
              おつまみ
            </p>
            {foods.map((food) => (
              <PairingRecordCard
                key={food.id}
                record={food}
                current={food.id === currentId}
              />
            ))}
          </div>
        </div>

        <form action={formAction} className="border-t border-zinc-100 pt-3">
          <input type="hidden" name="id" value={recordId} />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            disabled={pending}
            className="text-zinc-600"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              className="mr-1.5 h-3.5 w-3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden
            >
              <path d="M4 8h8" strokeLinecap="round" />
            </svg>
            {pending ? "処理中..." : "この記録をペアから外す"}
          </Button>
        </form>
      </div>
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
  const [selectedId, setSelectedId] = useState("");

  if (candidates.length === 0) {
    if (partnersExist) return null;
    return (
      <EmptyPairingState
        message="ペアにできる記録がありません"
        hint="反対の種別（お酒またはおつまみ）の未ペア記録が必要です"
      />
    );
  }

  const heading = partnersExist ? "ペアに追加する記録" : "ペアにする記録";
  const buttonText = partnersExist ? "ペアに追加" : "ペアにする";

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4"
    >
      <input type="hidden" name="id" value={recordId} />
      <input type="hidden" name="partner_id" value={selectedId} />

      <div>
        <h3 className="text-sm font-semibold text-zinc-900">{heading}</h3>
        <p className="mt-0.5 text-xs text-zinc-500">
          候補をタップして選択し、ボタンで確定してください
        </p>
      </div>

      <div
        className="max-h-72 space-y-2 overflow-y-auto pr-1"
        role="radiogroup"
        aria-label={heading}
      >
        {candidates.map((candidate) => (
          <PairingRecordCard
            key={candidate.id}
            record={candidate}
            selectable
            selected={selectedId === candidate.id}
            onSelect={() => setSelectedId(candidate.id)}
          />
        ))}
      </div>

      <Button type="submit" fullWidth disabled={pending || !selectedId}>
        {pending ? "処理中..." : buttonText}
      </Button>
    </form>
  );
}
