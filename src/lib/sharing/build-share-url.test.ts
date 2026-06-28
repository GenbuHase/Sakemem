import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  buildProfileUrl,
  buildRecordShareUrl,
} from "./build-share-url";

describe("build-share-url", () => {
  const original = process.env.NEXT_PUBLIC_SITE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://sakemem.example.com/";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = original;
  });

  it("builds record share URL", () => {
    expect(buildRecordShareUrl("genbu", "abc-123")).toBe(
      "https://sakemem.example.com/@genbu/abc-123",
    );
  });

  it("builds profile URL", () => {
    expect(buildProfileUrl("genbu")).toBe(
      "https://sakemem.example.com/@genbu",
    );
  });
});
