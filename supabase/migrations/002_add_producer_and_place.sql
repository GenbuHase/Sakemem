-- Sakemem: producer / place 追加とカラム順の整理（設計ドキュメント順）
-- 001 のみ適用済み、または末尾に追加された producer / place を持つ既存 DB 向け

ALTER TABLE public.records
  ADD COLUMN IF NOT EXISTS producer text,
  ADD COLUMN IF NOT EXISTS place text;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns AS producer_col
    JOIN information_schema.columns AS name_col
      ON name_col.table_schema = producer_col.table_schema
     AND name_col.table_name = producer_col.table_name
     AND name_col.column_name = 'name'
    WHERE producer_col.table_schema = 'public'
      AND producer_col.table_name = 'records'
      AND producer_col.column_name = 'producer'
      AND producer_col.ordinal_position = name_col.ordinal_position + 1
  ) THEN
    RETURN;
  END IF;

  CREATE TABLE public.records_ordered (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pair_id         uuid,
    created_at      timestamptz NOT NULL DEFAULT now(),
    date            date        NOT NULL,
    category        text        NOT NULL,
    name            text        NOT NULL,
    producer        text,
    sub_info        text,
    place           text,
    rating          integer     CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5)),
    flavor_metrics  jsonb       DEFAULT '{}'::jsonb,
    comment         text,

    CONSTRAINT records_category_check CHECK (
      category IN (
        'japanese-sake',
        'beer',
        'wine',
        'sour',
        'shochu',
        'whiskey',
        'liqueur',
        'cocktail',
        'food',
        'other'
      )
    )
  );

  INSERT INTO public.records_ordered (
    id,
    user_id,
    pair_id,
    created_at,
    date,
    category,
    name,
    producer,
    sub_info,
    place,
    rating,
    flavor_metrics,
    comment
  )
  SELECT
    id,
    user_id,
    pair_id,
    created_at,
    date,
    category,
    name,
    producer,
    sub_info,
    place,
    rating,
    flavor_metrics,
    comment
  FROM public.records;

  DROP TABLE public.records;
  ALTER TABLE public.records_ordered RENAME TO records;

  CREATE INDEX records_user_id_date_idx
    ON public.records (user_id, date DESC, created_at DESC);

  CREATE INDEX records_pair_id_idx
    ON public.records (pair_id)
    WHERE pair_id IS NOT NULL;

  COMMENT ON TABLE  public.records IS 'お酒・おつまみの記録';
  COMMENT ON COLUMN public.records.pair_id IS '同時に記録したお酒とおつまみを紐付ける共通ID';
  COMMENT ON COLUMN public.records.producer IS '蔵元・メーカー名（主にお酒）';
  COMMENT ON COLUMN public.records.sub_info IS 'スタイル、生産地、ビールスタイル、料理のジャンル等の補助情報';
  COMMENT ON COLUMN public.records.place IS '飲食した場所（店名・自宅 など）';
  COMMENT ON COLUMN public.records.flavor_metrics IS 'カテゴリ別の評価軸（例: {"sweetness": 4, "acidity": 3}）';

  ALTER TABLE public.records ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "records_select_own"
    ON public.records
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "records_insert_own"
    ON public.records
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "records_update_own"
    ON public.records
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "records_delete_own"
    ON public.records
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
END $$;
