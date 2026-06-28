import type { SakememRecord, RecordVisibility } from "@/lib/types/record";

export type SharedRecord = {
  id: string;
  pair_id: string | null;
  date: string;
  category: SakememRecord["category"];
  name: string;
  producer: string | null;
  style: string | null;
  sub_info: string | null;
  place: string | null;
  rating: number | null;
  flavor_metrics: SakememRecord["flavor_metrics"];
  comment: string | null;
  visibility: RecordVisibility;
  hide_place_when_shared: boolean;
  profile_username: string;
  profile_display_name: string;
  profile_bio: string | null;
  profile_avatar_url: string | null;
};

export function sharedRecordToSakememRecord(
  record: SharedRecord,
  userId = "shared",
): SakememRecord {
  return {
    id: record.id,
    user_id: userId,
    pair_id: record.pair_id,
    created_at: "",
    date: record.date,
    category: record.category,
    name: record.name,
    producer: record.producer,
    style: record.style,
    sub_info: record.sub_info,
    place: record.place,
    rating: record.rating,
    flavor_metrics: record.flavor_metrics ?? {},
    comment: record.comment,
    visibility: record.visibility,
    hide_place_when_shared: record.hide_place_when_shared,
  };
}

export function maskRecordPlace<T extends Pick<SakememRecord, "place" | "hide_place_when_shared">>(
  record: T,
): T {
  if (!record.hide_place_when_shared) {
    return record;
  }
  return { ...record, place: null };
}
