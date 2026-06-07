"use client";

import { Button } from "@/components/ui/button";
import { RecordCoreFields } from "./record-core-fields";

type PairFoodFieldsProps = {
  index: number;
  required?: boolean;
  onRemove?: () => void;
};

export function PairFoodFields({
  index,
  required = false,
  onRemove,
}: PairFoodFieldsProps) {
  return (
    <div className="space-y-4 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-sm font-semibold text-zinc-900">
          おつまみ {index + 1}
        </h4>
        {onRemove ? (
          <Button type="button" variant="ghost" size="sm" onClick={onRemove}>
            削除
          </Button>
        ) : null}
      </div>

      <RecordCoreFields
        prefix={`pair_${index}`}
        category="food"
        nameRequired={required}
        nameLabel="おつまみの名前"
        namePlaceholder="枝豆、焼き鳥 など"
        subInfoLabel="補助情報"
        subInfoPlaceholder="ジャンル、店名 など"
      />
    </div>
  );
}
