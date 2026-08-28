import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "記録を編集 | Sakemem",
  robots: { index: false, follow: false },
};

export default function EditRecordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
