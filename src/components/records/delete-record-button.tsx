"use client";

import { useTransition } from "react";
import { deleteRecord } from "@/app/actions/records";
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
          await deleteRecord(id);
        });
      }}
    >
      {isPending ? "削除中..." : label}
    </Button>
  );
}
