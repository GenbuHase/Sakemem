import { Building2, Info, MapPin, Tag } from "lucide-react";
import { isFoodCategory } from "@/lib/constants/categories";
import { getDrinkStyleLabel } from "@/lib/constants/drink-styles";
import type { SakememRecord } from "@/lib/types/record";
import { cx } from "@/components/ui/styles";
import { RecordMetadataRow } from "./record-metadata-row";

type RecordMetadataProps = {
  record: SakememRecord;
  className?: string;
};

export function RecordMetadata({ record, className }: RecordMetadataProps) {
  const styleLabel = getDrinkStyleLabel(record.category, record.style);
  const isFood = isFoodCategory(record.category);
  const producer = !isFood && record.producer ? record.producer : null;

  const rows = [
    producer
      ? { icon: Building2, label: "蔵元", value: producer }
      : null,
    styleLabel ? { icon: Tag, label: "種類", value: styleLabel } : null,
    record.sub_info
      ? { icon: Info, label: "補助情報", value: record.sub_info }
      : null,
    record.place
      ? { icon: MapPin, label: "場所", value: record.place }
      : null,
  ].filter((row) => row !== null);

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className={cx("mt-2 space-y-1", className)}>
      {rows.map((row) => (
        <RecordMetadataRow
          key={row.label}
          icon={row.icon}
          label={row.label}
          value={row.value}
        />
      ))}
    </div>
  );
}
