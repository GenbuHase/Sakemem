import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { buildPageMetadata } from "./build-metadata";

describe("buildPageMetadata", () => {
  const original = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://sakemem.example.com";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = original;
  });

  it("sets openGraph and twitter image URLs from the public path", () => {
    const metadata = buildPageMetadata({
      title: "Genbu | Sakemem",
      description: "公開晩酌記録",
      path: "/@genbu",
      imagePath: "/@genbu/opengraph-image",
    });

    expect(metadata.openGraph?.url).toBe("https://sakemem.example.com/@genbu");
    expect(metadata.alternates?.canonical).toBe("/@genbu");
    expect(metadata.openGraph?.images).toEqual([
      {
        url: "https://sakemem.example.com/@genbu/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Genbu | Sakemem",
      },
    ]);
    expect(metadata.twitter?.images).toEqual([
      "https://sakemem.example.com/@genbu/opengraph-image",
    ]);
  });

  it("omits image fields when imagePath is not provided", () => {
    const metadata = buildPageMetadata({
      title: "Sakemem",
      description: "説明",
      path: "/",
    });

    expect(metadata.openGraph?.images).toBeUndefined();
    expect(metadata.twitter?.images).toBeUndefined();
  });
});
