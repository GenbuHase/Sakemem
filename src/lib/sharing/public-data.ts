import "server-only";

import { cache } from "react";
import { getPublicClient } from "@/lib/supabase/public";
import { isUuid } from "@/lib/utils/is-uuid";
import {
  fetchPublicProfile,
  fetchPublicProfileRecordCount,
  fetchPublicProfileRecords,
  PUBLIC_PROFILE_RECORDS_PAGE_SIZE,
  fetchSharedPairRecords,
  fetchSharedRecord,
} from "./fetch-shared";

export const getPublicProfilePageData = cache(async (
  username: string,
  page = 1,
) => {
  const supabase = getPublicClient();
  const safePage = Math.max(1, page);
  const [profile, records, totalRecords] = await Promise.all([
    fetchPublicProfile(supabase, username),
    fetchPublicProfileRecords(supabase, username, {
      offset: (safePage - 1) * PUBLIC_PROFILE_RECORDS_PAGE_SIZE,
    }),
    fetchPublicProfileRecordCount(supabase, username),
  ]);

  return {
    profile,
    records,
    totalRecords,
    page: safePage,
    hasMore: safePage * PUBLIC_PROFILE_RECORDS_PAGE_SIZE < totalRecords,
  };
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
