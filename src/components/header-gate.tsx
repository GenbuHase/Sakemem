"use client";

import { usePathname } from "next/navigation";
import { isPublicProfilePath } from "@/lib/routing/public-profile-path";

type HeaderGateProps = {
  children: React.ReactNode;
};

export function HeaderGate({ children }: HeaderGateProps) {
  const pathname = usePathname() ?? "";

  if (isPublicProfilePath(pathname)) {
    return null;
  }

  return children;
}
