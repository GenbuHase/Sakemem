import type { Metadata } from "next";
import { getMetadataBase, siteName } from "./site";

export function buildPageMetadata(input: {
  title: string;
  description: string;
  path: string;
  robots?: Metadata["robots"];
}): Metadata {
  const base = getMetadataBase();
  const url = new URL(input.path, base);

  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url.pathname },
    openGraph: {
      title: input.title,
      description: input.description,
      url: url.toString(),
      siteName,
      locale: "ja_JP",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
    },
    robots: input.robots,
  };
}
