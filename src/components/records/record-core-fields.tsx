import { TextArea } from "@/components/ui/inputs";
import type { FlavorMetrics, RecordCategory } from "@/lib/types/record";
import { DrinkIdentityFields } from "./drink-identity-fields";
import { FlavorMetricsInput } from "./flavor-metrics-input";
import { RatingInput } from "./rating-input";

type RecordCoreFieldsProps = {
  prefix: string;
  category: RecordCategory;
  enableSakeSuggest?: boolean;
  nameRequired?: boolean;
  nameLabel: string;
  namePlaceholder?: string;
  subInfoLabel?: string;
  subInfoPlaceholder?: string;
  ratingLabel?: string;
  commentLabel?: string;
  commentPlaceholder?: string;
  defaultName?: string;
  defaultSubInfo?: string;
  defaultRating?: number | null;
  defaultComment?: string;
  defaultFlavorMetrics?: FlavorMetrics;
};

/**
 * 1 件分のレコードに対する入力フィールド一式（名前・補助情報・評価・味の評価・メモ）。
 * `prefix` を変えるだけで複数件をフォーム内に並べられる。
 */
export function RecordCoreFields({
  prefix,
  category,
  enableSakeSuggest = false,
  nameRequired = true,
  nameLabel,
  namePlaceholder,
  subInfoLabel,
  subInfoPlaceholder,
  ratingLabel = "総合評価",
  commentLabel = "メモ",
  commentPlaceholder = "感想やメモ",
  defaultName,
  defaultSubInfo,
  defaultRating,
  defaultComment,
  defaultFlavorMetrics,
}: RecordCoreFieldsProps) {
  const nameField = `${prefix}_name`;
  const subInfoField = `${prefix}_sub_info`;
  const commentField = `${prefix}_comment`;

  return (
    <>
      <DrinkIdentityFields
        enableSakeSuggest={enableSakeSuggest}
        nameField={nameField}
        subInfoField={subInfoField}
        nameId={nameField}
        subInfoId={subInfoField}
        nameLabel={nameLabel}
        namePlaceholder={namePlaceholder}
        subInfoLabel={subInfoLabel}
        subInfoPlaceholder={subInfoPlaceholder}
        nameRequired={nameRequired}
        defaultName={defaultName}
        defaultSubInfo={defaultSubInfo}
      />

      <RatingInput
        name={`${prefix}_rating`}
        label={ratingLabel}
        defaultValue={defaultRating}
      />
      <FlavorMetricsInput
        prefix={prefix}
        category={category}
        defaultValues={defaultFlavorMetrics}
      />

      <TextArea
        id={commentField}
        name={commentField}
        label={commentLabel}
        defaultValue={defaultComment}
        placeholder={commentPlaceholder}
      />
    </>
  );
}
