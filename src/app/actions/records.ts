"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { isFoodCategory } from "@/lib/constants/categories";
import {
  parseRecordCategory,
  parseRecordWritePayload,
  parseString,
  parsePlace,
} from "@/lib/records/parse-form";
import {
  filterLinkCandidates,
  getPartners,
  isOppositeRecordType,
} from "@/lib/records/pairing";
import {
  clearOrphanedPair,
  deleteRecordById,
  fetchAllRecords,
  fetchRecordById,
  insertRecords,
  mergePairIds,
  setRecordsPairId,
  updateRecordById,
  type RecordInsert,
} from "@/lib/records/repository";
import type { SakememRecord } from "@/lib/types/record";

export type RecordActionState = {
  error?: string;
};

export type RecordPairingContext = {
  record: SakememRecord;
  partners: SakememRecord[];
  linkCandidates: SakememRecord[];
};

const RECORDS_PATH = "/records";

function revalidateRecord(id?: string): void {
  revalidatePath(RECORDS_PATH);
  if (id) {
    revalidatePath(`${RECORDS_PATH}/${id}/edit`);
  }
}

function toErrorState(error: unknown, fallback: string): RecordActionState {
  return { error: error instanceof Error ? error.message : fallback };
}

export async function getRecords(): Promise<SakememRecord[]> {
  const { supabase } = await requireUser();
  return fetchAllRecords(supabase);
}

export async function getRecord(id: string): Promise<SakememRecord | null> {
  const { supabase } = await requireUser();
  return fetchRecordById(supabase, id);
}

export async function getRecordPairingContext(
  id: string,
): Promise<RecordPairingContext | null> {
  const { supabase } = await requireUser();
  const records = await fetchAllRecords(supabase);
  const record = records.find((candidate) => candidate.id === id);

  if (!record) {
    return null;
  }

  return {
    record,
    partners: getPartners(records, record),
    linkCandidates: filterLinkCandidates(records, record),
  };
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
    await insertRecords(supabase, inserts);
  } catch (error) {
    return toErrorState(error, "記録の保存に失敗しました。");
  }

  revalidateRecord();
  redirect(RECORDS_PATH);
}

export async function updateRecord(
  _prevState: RecordActionState | null,
  formData: FormData,
): Promise<RecordActionState> {
  const { supabase } = await requireUser();

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
    await updateRecordById(
      supabase,
      id,
      parseRecordWritePayload(formData, {
        prefix: "record",
        date,
        category,
        name,
      }),
    );
  } catch (error) {
    return toErrorState(error, "記録の更新に失敗しました。");
  }

  revalidateRecord(id);
  redirect(RECORDS_PATH);
}

export async function unlinkRecordPair(
  _prevState: RecordActionState | null,
  formData: FormData,
): Promise<RecordActionState> {
  const { supabase } = await requireUser();
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
    await setRecordsPairId(supabase, [id], null);
    await clearOrphanedPair(supabase, previousPairId);
  } catch (error) {
    return toErrorState(error, "ペアの解除に失敗しました。");
  }

  revalidateRecord(id);
  return {};
}

export async function linkRecordPair(
  _prevState: RecordActionState | null,
  formData: FormData,
): Promise<RecordActionState> {
  const { supabase } = await requireUser();
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
  } catch (error) {
    return toErrorState(error, "ペアの設定に失敗しました。");
  }

  revalidateRecord(id);
  return {};
}

export async function deleteRecord(id: string): Promise<void> {
  const { supabase } = await requireUser();

  const record = await fetchRecordById(supabase, id);
  if (!record) {
    throw new Error("記録が見つかりません。");
  }

  await deleteRecordById(supabase, id);

  if (record.pair_id) {
    await clearOrphanedPair(supabase, record.pair_id);
  }

  revalidateRecord();
}
