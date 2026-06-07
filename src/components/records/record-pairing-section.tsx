"use client";

import { useActionState } from "react";
import {
  updateRecordPairing,
  type RecordActionState,
} from "@/app/actions/records";
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
  const [state, formAction, pending] = useActionState(
    updateRecordPairing,
    initialState,
  );

  return (
    <section className="rounded-xl border border-zinc-200 bg-zinc-50 p-5">
      <h2 className="text-lg font-semibold text-zinc-900">ペアリング</h2>
      <p className="mt-1 text-sm text-zinc-500">
        お酒とおつまみを後からペアにしたり、複数の記録をまとめてペアにできます。
      </p>

      <div className="mt-4 space-y-4">
        {partners.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-medium text-zinc-700">現在のペア</p>
            <ul className="space-y-2">
              {partners.map((partner) => (
                <li
                  key={partner.id}
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700"
                >
                  {formatCandidateLabel(partner)}
                </li>
              ))}
            </ul>

            <form action={formAction}>
              <input type="hidden" name="id" value={record.id} />
              <input type="hidden" name="pairing_action" value="unlink" />
              <button
                type="submit"
                disabled={pending}
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending ? "処理中..." : "この記録をペアから外す"}
              </button>
            </form>
          </div>
        ) : (
          <p className="text-sm text-zinc-600">現在はペアリングされていません。</p>
        )}

        {linkCandidates.length > 0 ? (
          <form action={formAction} className="space-y-3">
            <input type="hidden" name="id" value={record.id} />
            <input type="hidden" name="pairing_action" value="link" />

            <div>
              <label
                htmlFor="partner_id"
                className="mb-1.5 block text-sm font-medium text-zinc-700"
              >
                {partners.length > 0 ? "ペアに追加する記録" : "ペアにする記録"}
              </label>
              <select
                id="partner_id"
                name="partner_id"
                required
                defaultValue=""
                className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200"
              >
                <option value="" disabled>
                  記録を選択
                </option>
                {linkCandidates.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {formatCandidateLabel(candidate)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending
                ? "処理中..."
                : partners.length > 0
                  ? "ペアに追加"
                  : "ペアにする"}
            </button>
          </form>
        ) : partners.length === 0 ? (
          <p className="text-sm text-zinc-500">
            ペアにできる未ペアの記録がありません。
          </p>
        ) : null}
      </div>

      {state?.error ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}

      {state && !state.error ? (
        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          ペアリングを更新しました。
        </p>
      ) : null}
    </section>
  );
}
