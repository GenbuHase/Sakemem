import type { Metadata } from "next";
import Link from "next/link";
import { RecordForm } from "@/components/records/record-form";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "記録する | Sakemem",
};

export default async function NewRecordPage() {
  await requireUser();

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-10">
      <div className="mb-8">
        <Link
          href="/records"
          className="text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
        >
          ← タイムラインに戻る
        </Link>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">
          記録する
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          カテゴリでお酒とおつまみを切り替えられます。お酒を選んだときは、おつまみの同時記録もできます。
        </p>
      </div>

      <RecordForm />
    </div>
  );
}
