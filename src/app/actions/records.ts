"use server";

import { randomUUID } from "crypto";
import { after } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { fetchProfileByUserId } from "@/lib/profiles/repository";
import {
  revalidatePublicProfile,
  revalidatePublicRecord,
} from "@/lib/routing/revalidate-public";
import { isFoodCategory } from "@/lib/constants/categories";
import {
  parseRecordCategory,
  parseRecordWritePayload,
  parseString,
  parsePlace,
} from "@/lib/records/parse-form";
import {
  isOppositeRecordType,
} from "@/lib/records/pairing";
import {
  clearOrphanedPair,
  deleteRecordById,
  fetchRecordById,
  fetchRecordsByPairId,
  insertRecords,
  mergePairIds,
  setRecordsPairId,
  updateRecordById,
  type RecordInsert,
} from "@/lib/records/repository";
import type { SakememRecord } from "@/lib/types/record";

export type RecordActionState = {
  error?: string;
  records?: SakememRecord[];
  removedIds?: string[];
};

async function revalidateSharedRecords(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string,
  ...recordIds: string[]
): Promise<void> {
  const profile = await fetchProfileByUserId(supabase, userId);
  if (!profile) return;

  recordIds.forEach((recordId) =>
    revalidatePublicRecord(profile.username, recordId),
  );
}

function scheduleSharedRecordsRevalidation(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string,
  ...recordIds: string[]
): void {
  after(() => revalidateSharedRecords(supabase, userId, ...recordIds));
}

function schedulePublicProfileRevalidationIfNeeded(
  supabase: Awaited<ReturnType<typeof import("@/lib/supabase/server").createClient>>,
  userId: string,
  inserts: RecordInsert[],
): void {
  const hasPublicRecord = inserts.some(
    (insert) => insert.visibility === "public",
  );
  if (!hasPublicRecord) return;

  after(async () => {
    const profile = await fetchProfileByUserId(supabase, userId);
    if (profile) {
      revalidatePublicProfile(profile.username);
    }
  });
}

function toErrorState(error: unknown, fallback: string): RecordActionState {
  return { error: error instanceof Error ? error.message : fallback };
}

export async function createRecords(
  _prevState: RecordActionState | null,
  formData: FormData,
): Promise<RecordActionState> {
  const { supabase, user } = await requireUser();

  const date = parseString(formData, "date");
  const rawCategory = parseString(formData, "category");
  const name = parseString(formData, "record_name");

  if (!date || !rawCategory || !name) {
    return { error: "日付、カテゴリ、名前は必須です。" };
  }

  const category = parseRecordCategory(rawCategory);
  if (!category) {
    return { error: "カテゴリが不正です。" };
  }

  const includePairFood =
    !isFoodCategory(category) && formData.get("include_pair_food") === "on";
  const pairId = includePairFood ? randomUUID() : null;
  const place = parsePlace(formData);

  const inserts: RecordInsert[] = [
    {
      user_id: user.id,
      pair_id: pairId,
      ...parseRecordWritePayload(formData, {
        prefix: "record",
        date,
        category,
        name,
        place,
      }),
    },
  ];

  if (includePairFood && pairId) {
    const pairFoodCount = Number(formData.get("pair_food_count") ?? 1);
    if (!Number.isInteger(pairFoodCount) || pairFoodCount < 1) {
      return { error: "おつまみの件数が不正です。" };
    }

    for (let index = 0; index < pairFoodCount; index += 1) {
      const prefix = `pair_${index}`;
      const pairName = parseString(formData, `${prefix}_name`);

      if (!pairName) {
        return { error: `おつまみ ${index + 1} の名前を入力してください。` };
      }

      inserts.push({
        user_id: user.id,
        pair_id: pairId,
        ...parseRecordWritePayload(formData, {
          prefix,
          date,
          category: "food",
          name: pairName,
          place,
        }),
      });
    }
  }

  try {
    const records = await insertRecords(supabase, inserts);
    schedulePublicProfileRevalidationIfNeeded(supabase, user.id, inserts);
    return { records };
  } catch (error) {
    return toErrorState(error, "記録の保存に失敗しました。");
  }
}

export async function updateRecord(
  _prevState: RecordActionState | null,
  formData: FormData,
): Promise<RecordActionState> {
  const { supabase, user } = await requireUser();

  const id = parseString(formData, "id");
  const date = parseString(formData, "date");
  const rawCategory = parseString(formData, "category");
  const name = parseString(formData, "record_name");

  if (!id || !date || !rawCategory || !name) {
    return { error: "必須項目を入力してください。" };
  }

  const category = parseRecordCategory(rawCategory);
  if (!category) {
    return { error: "カテゴリが不正です。" };
  }

  try {
    const record = await updateRecordById(
      supabase,
      id,
      parseRecordWritePayload(formData, {
        prefix: "record",
        date,
        category,
        name,
      }),
    );
    scheduleSharedRecordsRevalidation(supabase, user.id, id);
    return { records: [record] };
  } catch (error) {
    return toErrorState(error, "記録の更新に失敗しました。");
  }
}

export async function unlinkRecordPair(
  _prevState: RecordActionState | null,
  formData: FormData,
): Promise<RecordActionState> {
  const { supabase, user } = await requireUser();
  const id = parseString(formData, "id");

  if (!id) {
    return { error: "記録が指定されていません。" };
  }

  try {
    const record = await fetchRecordById(supabase, id);
    if (!record) {
      return { error: "記録が見つかりません。" };
    }
    if (!record.pair_id) {
      return { error: "この記録はペアリングされていません。" };
    }

    const previousPairId = record.pair_id;
    const previousPartners = await fetchRecordsByPairId(supabase, previousPairId);
    await setRecordsPairId(supabase, [id], null);
    await clearOrphanedPair(supabase, previousPairId);
    const remainingPartners = await fetchRecordsByPairId(supabase, previousPairId);
    const records = [
      { ...record, pair_id: null },
      ...(remainingPartners.length > 0
        ? remainingPartners
        : previousPartners
            .filter((partner) => partner.id !== id)
            .map((partner) => ({ ...partner, pair_id: null }))),
    ];
    scheduleSharedRecordsRevalidation(supabase, user.id, id);
    return { records };
  } catch (error) {
    return toErrorState(error, "ペアの解除に失敗しました。");
  }
}

export async function linkRecordPair(
  _prevState: RecordActionState | null,
  formData: FormData,
): Promise<RecordActionState> {
  const { supabase, user } = await requireUser();
  const id = parseString(formData, "id");
  const partnerId = parseString(formData, "partner_id");

  if (!id) {
    return { error: "記録が指定されていません。" };
  }
  if (!partnerId) {
    return { error: "ペアにする記録を選択してください。" };
  }

  try {
    const [record, partner] = await Promise.all([
      fetchRecordById(supabase, id),
      fetchRecordById(supabase, partnerId),
    ]);

    if (!record) {
      return { error: "記録が見つかりません。" };
    }
    if (!partner) {
      return { error: "ペアにする記録が見つかりません。" };
    }
    if (!isOppositeRecordType(record, partner)) {
      return { error: "お酒とおつまみのみペアにできます。" };
    }

    if (
      record.pair_id &&
      partner.pair_id &&
      record.pair_id !== partner.pair_id
    ) {
      await mergePairIds(supabase, partner.pair_id, record.pair_id);
    } else {
      const pairId = record.pair_id ?? partner.pair_id ?? randomUUID();
      await setRecordsPairId(supabase, [record.id, partner.id], pairId);
    }
    const updatedRecord = await fetchRecordById(supabase, record.id);
    const records =
      updatedRecord?.pair_id
        ? await fetchRecordsByPairId(supabase, updatedRecord.pair_id)
        : [updatedRecord, partner].filter(
            (candidate): candidate is SakememRecord => candidate !== null,
          );
    scheduleSharedRecordsRevalidation(supabase, user.id, id, partnerId);
    return { records };
  } catch (error) {
    return toErrorState(error, "ペアの設定に失敗しました。");
  }
}

export async function deleteRecord(id: string): Promise<RecordActionState> {
  try {
    const { supabase, user } = await requireUser();
    const record = await fetchRecordById(supabase, id);
    if (!record) {
      return { error: "記録が見つかりません。" };
    }

    const pairRecords = record.pair_id
      ? await fetchRecordsByPairId(supabase, record.pair_id)
      : [];
    await deleteRecordById(supabase, id);

    if (record.pair_id) {
      await clearOrphanedPair(supabase, record.pair_id);
    }

    scheduleSharedRecordsRevalidation(supabase, user.id, id);
    const remainingPairRecords = pairRecords
      .filter((candidate) => candidate.id !== id)
      .map((candidate) =>
        pairRecords.length <= 2 ? { ...candidate, pair_id: null } : candidate,
      );
    return { records: remainingPairRecords, removedIds: [id] };
  } catch (error) {
    return toErrorState(error, "記録の削除に失敗しました。");
  }
}
