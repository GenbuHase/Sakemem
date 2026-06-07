import {
  getCategoryLabel,
  isFoodCategory,
} from "@/lib/constants/categories";
import type { RecordCategory, SakememRecord } from "@/lib/types/record";

export type CategoryStat = {
  category: RecordCategory;
  label: string;
  count: number;
  avgRating: number | null;
};

export type TopRatedItem = {
  id: string;
  name: string;
  category: RecordCategory;
  label: string;
  rating: number;
};

export type RecordAnalysis = {
  total: number;
  drinkCount: number;
  foodCount: number;
  pairedSessionCount: number;
  categoryStats: CategoryStat[];
  topRated: TopRatedItem[];
};

function averageRating(records: SakememRecord[]): number | null {
  const rated = records
    .map((record) => record.rating)
    .filter((rating): rating is number => rating !== null);

  if (rated.length === 0) {
    return null;
  }

  const sum = rated.reduce((total, rating) => total + rating, 0);
  return Math.round((sum / rated.length) * 10) / 10;
}

export function analyzeRecords(records: SakememRecord[]): RecordAnalysis {
  const drinkCount = records.filter(
    (record) => !isFoodCategory(record.category),
  ).length;
  const foodCount = records.filter((record) =>
    isFoodCategory(record.category),
  ).length;

  const pairIds = new Set(
    records
      .map((record) => record.pair_id)
      .filter((pairId): pairId is string => pairId !== null),
  );

  const byCategory = new Map<RecordCategory, SakememRecord[]>();
  for (const record of records) {
    const group = byCategory.get(record.category) ?? [];
    group.push(record);
    byCategory.set(record.category, group);
  }

  const categoryStats = [...byCategory.entries()]
    .map(([category, group]) => ({
      category,
      label: getCategoryLabel(category),
      count: group.length,
      avgRating: averageRating(group),
    }))
    .sort((a, b) => b.count - a.count);

  const topRated = records
    .filter((record): record is SakememRecord & { rating: number } =>
      record.rating !== null,
    )
    .sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name, "ja"))
    .slice(0, 5)
    .map((record) => ({
      id: record.id,
      name: record.name,
      category: record.category,
      label: getCategoryLabel(record.category),
      rating: record.rating,
    }));

  return {
    total: records.length,
    drinkCount,
    foodCount,
    pairedSessionCount: pairIds.size,
    categoryStats,
    topRated,
  };
}
