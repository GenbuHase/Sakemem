import type { Metadata } from "next";
import { Suspense } from "react";
import {
  RecordsPageContent,
  RecordsPageSkeleton,
} from "@/components/records/records-page-content";

export const metadata: Metadata = {
  title: "タイムライン | Sakemem",
  robots: { index: false, follow: false },
};

export default function RecordsPage() {
  return (
    <Suspense fallback={<RecordsPageSkeleton />}>
      <RecordsPageContent />
    </Suspense>
  );
}
