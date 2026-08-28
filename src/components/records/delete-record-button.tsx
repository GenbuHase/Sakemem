"use client";

import { useTransition } from "react";
import { deleteRecord } from "@/app/actions/records";
import { useRecords } from "@/components/providers/records-provider";
import { Button } from "@/components/ui/button";

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
  const { loadRecords, removeRecords, upsertRecords } = useRecords();

  const confirmMessage = pairId
    ? "この記録を削除しますか？ペアの相手の記録は残ります。"
    : "この記録を削除しますか？";

  return (
    <Button
      variant="danger"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (!window.confirm(confirmMessage)) return;

        startTransition(async () => {
          const removedRecords = removeRecords([id]);

          const result = await deleteRecord(id);
          if (result.error) {
            await loadRecords({ force: true }).catch(() => {
              upsertRecords(removedRecords);
            });
            window.alert(result.error);
            return;
          }

          if (result.records) {
            upsertRecords(result.records);
          }
        });
      }}
    >
      {isPending ? "削除中..." : label}
    </Button>
  );
}
