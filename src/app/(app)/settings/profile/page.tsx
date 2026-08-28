import type { Metadata } from "next";
import { ProfileSettingsPageContent } from "@/components/profiles/profile-settings-page-content";

export const metadata: Metadata = {
  title: "プロフィール設定 | Sakemem",
  robots: { index: false, follow: false },
};

export default function SettingsProfilePage() {
  return <ProfileSettingsPageContent />;
}
