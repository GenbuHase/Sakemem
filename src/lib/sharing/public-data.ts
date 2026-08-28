import "server-only";

import { cache } from "react";
import { getPublicClient } from "@/lib/supabase/public";
import { isUuid } from "@/lib/utils/is-uuid";
import {
  fetchPublicProfile,
  fetchPublicProfileRecords,
  fetchSharedPairRecords,
  fetchSharedRecord,
} from "./fetch-shared";

export const getPublicProfilePageData = cache(async (username: string) => {
  const supabase = getPublicClient();
  const [profile, records] = await Promise.all([
    fetchPublicProfile(supabase, username),
    fetchPublicProfileRecords(supabase, username),
  ]);

  return { profile, records };
});

export const getSharedRecordPageData = cache(
  async (username: string, recordId: string) => {
    if (!isUuid(recordId)) {
      return { record: null, pairRecords: [] };
    }

    const supabase = getPublicClient();
    const record = await fetchSharedRecord(supabase, username, recordId);
    if (!record) {
      return { record: null, pairRecords: [] };
    }

    const pairRecords = record.pair_id
      ? await fetchSharedPairRecords(
          supabase,
          username,
          record.pair_id,
          record.id,
        )
      : [];

    return { record, pairRecords };
  },
);
