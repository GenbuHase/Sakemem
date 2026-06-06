"use client";

import { useTransition } from "react";
import { deleteRecord } from "@/app/actions/records";

type DeleteRecordButtonProps = {
  id: string;
  label?: string;
};

export function DeleteRecordButton({
  id,
  label = "削除",
}: DeleteRecordButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm("この記録を削除しますか？")) return;

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
