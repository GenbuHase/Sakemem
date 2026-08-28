import { AuthenticatedApp } from "@/components/layout/authenticated-app";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedApp>{children}</AuthenticatedApp>;
}
