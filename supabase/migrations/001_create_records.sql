-- Sakemem: records テーブル作成 & RLS 設定
-- Supabase SQL Editor または supabase db push で実行

CREATE TABLE public.records (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pair_id         uuid,
  created_at      timestamptz NOT NULL DEFAULT now(),
  date            date        NOT NULL,
  category        text        NOT NULL,
  name            text        NOT NULL,
  sub_info        text,
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

CREATE INDEX records_user_id_date_idx
  ON public.records (user_id, date DESC, created_at DESC);

CREATE INDEX records_pair_id_idx
  ON public.records (pair_id)
  WHERE pair_id IS NOT NULL;

COMMENT ON TABLE  public.records IS 'お酒・おつまみの記録';
COMMENT ON COLUMN public.records.pair_id IS '同時に記録したお酒とおつまみを紐付ける共通ID';
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
