import { PairRecordCard } from "@/components/records/pair-record-card";
import { RecordDetail } from "@/components/records/record-detail";
import { splitDrinksAndFoods } from "@/lib/records/split-pair";
import type { SakememRecord } from "@/lib/types/record";
import { formatRecordDate } from "@/lib/utils/date";

type SharedRecordContentProps = {
  mainRecord: SakememRecord;
  pairRecords?: SakememRecord[];
  date: string;
};

export function SharedRecordContent({
  mainRecord,
  pairRecords = [],
  date,
}: SharedRecordContentProps) {
  const allRecords = [mainRecord, ...pairRecords];
  const { drinks, foods, isPaired } = splitDrinksAndFoods(allRecords);

  return (
    <>
      <time
        dateTime={date}
        className="mb-3 block text-sm font-medium text-zinc-500"
      >
        {formatRecordDate(date)}
      </time>

      {isPaired ? (
        <PairRecordCard
          drinks={drinks}
          foods={foods}
          showActions={false}
          showCounts={false}
          gridClassName="md:grid-cols-2"
          pairRecords={allRecords}
        />
      ) : (
        <RecordDetail record={mainRecord} showActions={false} />
      )}
    </>
  );
}
