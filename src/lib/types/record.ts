export const RECORD_CATEGORIES = [
  "japanese-sake",
  "beer",
  "wine",
  "sour",
  "shochu",
  "whiskey",
  "liqueur",
  "cocktail",
  "food",
  "other",
] as const;

export type RecordCategory = (typeof RECORD_CATEGORIES)[number];

export type FlavorMetrics = Record<string, number>;

export type SakememRecord = {
  id: string;
  user_id: string;
  pair_id: string | null;
  created_at: string;
  date: string;
  category: RecordCategory;
  name: string;
  producer: string | null;
  sub_info: string | null;
  place: string | null;
  rating: number | null;
  flavor_metrics: FlavorMetrics;
  comment: string | null;
};
