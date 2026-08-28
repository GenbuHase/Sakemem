"use client";

import { PublicHeaderNav } from "@/components/layout/public-header-nav";
import {
  useAuth,
  useProfile,
} from "@/components/providers/auth-provider";

export function PublicHeader() {
  const { status } = useAuth();
  const { profile } = useProfile();

  return (
    <PublicHeaderNav
      isLoggedIn={status === "authenticated"}
      loading={status === "loading"}
      myUsername={profile?.username ?? null}
    />
  );
}
