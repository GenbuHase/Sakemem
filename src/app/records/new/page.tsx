import type { Metadata } from "next";
import { RecordForm } from "@/components/records/record-form";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "記録する | Sakemem",
};

export default async function NewRecordPage() {
  await requireUser();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        backHref="/records"
        backLabel="タイムラインに戻る"
        title="記録する"
        description="カテゴリでお酒とおつまみを切り替えられます。お酒を選んだときは、おつまみの同時記録もできます。"
      />

      <RecordForm />
    </div>
  );
}
