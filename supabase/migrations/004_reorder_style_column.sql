-- Sakemem: style 列を producer と sub_info の間へ並べ替え（設計ドキュメント順）
-- 003 適用済みで style が末尾に追加されている既存 DB 向け

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'records'
      AND column_name = 'style'
  ) THEN
    RAISE EXCEPTION 'records.style が存在しません。003_add_style.sql を先に適用してください。';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.columns AS style_col
    JOIN information_schema.columns AS producer_col
      ON producer_col.table_schema = style_col.table_schema
     AND producer_col.table_name = style_col.table_name
     AND producer_col.column_name = 'producer'
    JOIN information_schema.columns AS sub_info_col
      ON sub_info_col.table_schema = style_col.table_schema
     AND sub_info_col.table_name = style_col.table_name
     AND sub_info_col.column_name = 'sub_info'
    WHERE style_col.table_schema = 'public'
      AND style_col.table_name = 'records'
      AND style_col.column_name = 'style'
      AND style_col.ordinal_position = producer_col.ordinal_position + 1
      AND sub_info_col.ordinal_position = style_col.ordinal_position + 1
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
    style           text,
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
    style,
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
    style,
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
  COMMENT ON COLUMN public.records.style IS 'カテゴリ内の種類（例: wine=red, whiskey=scotch）';
  COMMENT ON COLUMN public.records.sub_info IS '生産地・品種・熟成年数・料理のジャンル等の補助情報（種類とは別フィールド）';
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
