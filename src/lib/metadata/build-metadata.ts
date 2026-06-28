import type { Metadata } from "next";
import { getMetadataBase, siteName } from "./site";

const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

export function buildPageMetadata(input: {
  title: string;
  description: string;
  path: string;
  imagePath?: string;
  robots?: Metadata["robots"];
}): Metadata {
  const base = getMetadataBase();
  const url = new URL(input.path, base);
  const imageUrl = input.imagePath
    ? new URL(input.imagePath, base).toString()
    : undefined;
  const images = imageUrl
    ? [{ url: imageUrl, ...OG_IMAGE_SIZE, alt: input.title }]
    : undefined;

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
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      ...(imageUrl ? { images: [imageUrl] } : {}),
    },
    robots: input.robots,
  };
}
