-- カテゴリ内の種類（ワインの赤/白、ウイスキーのスコッチ など）を保持する列を追加

ALTER TABLE public.records
  ADD COLUMN style text;

COMMENT ON COLUMN public.records.style IS 'カテゴリ内の種類（例: wine=red, whiskey=scotch）';

-- ワインの sub_info に埋め込まれていた種類を style 列へ移行
WITH parsed AS (
  SELECT
    id,
    CASE split_part(sub_info, ' / ', 1)
      WHEN '赤' THEN 'red'
      WHEN '白' THEN 'white'
      WHEN 'ロゼ' THEN 'rose'
      WHEN 'スパークリング' THEN 'sparkling'
      WHEN 'その他' THEN 'other'
      ELSE NULL
    END AS extracted_style,
    CASE
      WHEN sub_info ~ '^(赤|白|ロゼ|スパークリング|その他) / ' THEN
        NULLIF(split_part(sub_info, ' / ', 2), '')
      WHEN sub_info IN ('赤', '白', 'ロゼ', 'スパークリング', 'その他') THEN NULL
      ELSE sub_info
    END AS extracted_sub_info
  FROM public.records
  WHERE category = 'wine'
    AND sub_info IS NOT NULL
    AND split_part(sub_info, ' / ', 1) IN (
      '赤', '白', 'ロゼ', 'スパークリング', 'その他'
    )
)
UPDATE public.records AS records
SET
  style = parsed.extracted_style,
  sub_info = parsed.extracted_sub_info
FROM parsed
WHERE records.id = parsed.id;
