import { isFoodCategory } from "@/lib/constants/categories";
import type { SakememRecord } from "@/lib/types/record";

export function splitDrinksAndFoods(records: SakememRecord[]) {
  const drinks = records.filter((record) => !isFoodCategory(record.category));
  const foods = records.filter((record) => isFoodCategory(record.category));

  return {
    drinks,
    foods,
    isPaired: drinks.length > 0 && foods.length > 0,
  };
}
