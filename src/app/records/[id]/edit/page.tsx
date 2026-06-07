import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getRecordPairingContext } from "@/app/actions/records";
import { EditRecordForm } from "@/components/records/edit-record-form";
import { RecordPairingSection } from "@/components/records/record-pairing-section";
import { requireUser } from "@/lib/auth/require-user";

type EditRecordPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "記録を編集 | Sakemem",
};

export default async function EditRecordPage({ params }: EditRecordPageProps) {
  await requireUser();
  const { id } = await params;
  const pairingContext = await getRecordPairingContext(id);

  if (!pairingContext) {
    notFound();
  }

  const { record, partners, linkCandidates } = pairingContext;

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
          記録を編集
        </h1>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <EditRecordForm record={record} />
        </div>

        <RecordPairingSection
          record={record}
          partners={partners}
          linkCandidates={linkCandidates}
        />
      </div>
    </div>
  );
}
