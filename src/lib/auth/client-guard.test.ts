import { describe, expect, it } from "vitest";
import { getClientAuthRedirect } from "./client-guard";

describe("getClientAuthRedirect", () => {
  it("waits while loading and allows authenticated users", () => {
    expect(getClientAuthRedirect("loading", "/records")).toBeNull();
    expect(getClientAuthRedirect("authenticated", "/records")).toBeNull();
  });

  it("keeps the requested private path for anonymous users", () => {
    expect(
      getClientAuthRedirect("anonymous", "/records/record-1/edit"),
    ).toBe(
      "/login?next=%2Frecords%2Frecord-1%2Fedit",
    );
  });

  it("falls back when the pathname is not a safe app path", () => {
    expect(getClientAuthRedirect("anonymous", "//example.com")).toBe(
      "/login?next=%2Frecords",
    );
  });
});
