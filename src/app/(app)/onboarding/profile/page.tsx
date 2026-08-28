import type { Metadata } from "next";
import { OnboardingProfilePageContent } from "@/components/profiles/onboarding-profile-page-content";

export const metadata: Metadata = {
  title: "プロフィール設定 | Sakemem",
  robots: { index: false, follow: false },
};

export default function OnboardingProfilePage() {
  return <OnboardingProfilePageContent />;
}
