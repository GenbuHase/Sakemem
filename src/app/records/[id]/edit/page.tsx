import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getRecordPairingContext } from "@/app/actions/records";
import { EditRecordForm } from "@/components/records/edit-record-form";
import { RecordPairingSection } from "@/components/records/record-pairing-section";
import { PageHeader } from "@/components/ui/page-header";
import { requireUser } from "@/lib/auth/require-user";

type EditRecordPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "記録を編集 | Sakemem",
  robots: { index: false, follow: false },
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
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
      <PageHeader
        backHref="/records"
        backLabel="タイムラインに戻る"
        title="記録を編集"
      />

      <div className="space-y-6">
        <EditRecordForm record={record} />

        <RecordPairingSection
          record={record}
          partners={partners}
          linkCandidates={linkCandidates}
        />
      </div>
    </div>
  );
}
