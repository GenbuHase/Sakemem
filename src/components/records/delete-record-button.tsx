"use client";

import { useTransition } from "react";
import { deleteRecord } from "@/app/actions/records";

type DeleteRecordButtonProps = {
  id: string;
  pairId?: string | null;
  label?: string;
};

export function DeleteRecordButton({
  id,
  pairId = null,
  label = "削除",
}: DeleteRecordButtonProps) {
  const [isPending, startTransition] = useTransition();

  const confirmMessage = pairId
    ? "この記録はお酒とおつまみのペアです。両方とも削除します。よろしいですか？"
    : "この記録を削除しますか？";

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(confirmMessage)) return;

        startTransition(async () => {
          await deleteRecord(id);
        });
      }}
      className="text-sm text-red-600 transition hover:text-red-700 disabled:opacity-50"
    >
      {isPending ? "削除中..." : label}
    </button>
  );
}
