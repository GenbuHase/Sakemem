import { describe, expect, it, vi } from "vitest";
import { createClientDataLoader } from "./client-data-loader";

describe("createClientDataLoader", () => {
  it("deduplicates concurrent requests and reuses the session cache", async () => {
    let resolveRequest: (value: string[]) => void = () => undefined;
    const fetchValue = vi.fn(
      () =>
        new Promise<string[]>((resolve) => {
          resolveRequest = resolve;
        }),
    );
    const loader = createClientDataLoader(fetchValue);

    const first = loader.load();
    const second = loader.load();

    expect(first).toBe(second);
    await Promise.resolve();
    resolveRequest(["record-1"]);
    await expect(first).resolves.toEqual(["record-1"]);
    await expect(loader.load()).resolves.toEqual(["record-1"]);
    expect(fetchValue).toHaveBeenCalledTimes(1);
  });

  it("refetches when forced or cleared", async () => {
    const fetchValue = vi
      .fn<() => Promise<number>>()
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(2)
      .mockResolvedValueOnce(3);
    const loader = createClientDataLoader(fetchValue);

    await expect(loader.load()).resolves.toBe(1);
    await expect(loader.load({ force: true })).resolves.toBe(2);
    loader.clear();
    await expect(loader.load()).resolves.toBe(3);
    expect(fetchValue).toHaveBeenCalledTimes(3);
  });

  it("accepts mutation results as the next cached value", async () => {
    const fetchValue = vi.fn(async () => ["server"]);
    const loader = createClientDataLoader(fetchValue);

    loader.prime(["mutation"]);

    await expect(loader.load()).resolves.toEqual(["mutation"]);
    expect(fetchValue).not.toHaveBeenCalled();
  });
});
