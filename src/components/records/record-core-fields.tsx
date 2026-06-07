import { TextArea } from "@/components/ui/inputs";
import { isFoodCategory } from "@/lib/constants/categories";
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
  producerLabel?: string;
  producerPlaceholder?: string;
  subInfoLabel?: string;
  subInfoPlaceholder?: string;
  ratingLabel?: string;
  commentLabel?: string;
  commentPlaceholder?: string;
  defaultName?: string;
  defaultProducer?: string;
  defaultSubInfo?: string;
  defaultRating?: number | null;
  defaultComment?: string;
  defaultFlavorMetrics?: FlavorMetrics;
};

/**
 * 1 件分のレコードに対する入力フィールド一式（名前・蔵元/メーカー・補助情報・評価・味の評価・メモ）。
 * `prefix` を変えるだけで複数件をフォーム内に並べられる。
 */
export function RecordCoreFields({
  prefix,
  category,
  enableSakeSuggest = false,
  nameRequired = true,
  nameLabel,
  namePlaceholder,
  producerLabel,
  producerPlaceholder,
  subInfoLabel,
  subInfoPlaceholder,
  ratingLabel = "総合評価",
  commentLabel = "メモ",
  commentPlaceholder = "感想やメモ",
  defaultName,
  defaultProducer,
  defaultSubInfo,
  defaultRating,
  defaultComment,
  defaultFlavorMetrics,
}: RecordCoreFieldsProps) {
  const nameField = `${prefix}_name`;
  const producerField = `${prefix}_producer`;
  const subInfoField = `${prefix}_sub_info`;
  const commentField = `${prefix}_comment`;
  const isFood = isFoodCategory(category);

  return (
    <>
      <DrinkIdentityFields
        enableSakeSuggest={enableSakeSuggest}
        showProducer={!isFood}
        nameField={nameField}
        producerField={producerField}
        subInfoField={subInfoField}
        nameId={nameField}
        producerId={producerField}
        subInfoId={subInfoField}
        nameLabel={nameLabel}
        namePlaceholder={namePlaceholder}
        producerLabel={producerLabel}
        producerPlaceholder={producerPlaceholder}
        subInfoLabel={subInfoLabel}
        subInfoPlaceholder={subInfoPlaceholder}
        nameRequired={nameRequired}
        defaultName={defaultName}
        defaultProducer={defaultProducer}
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
