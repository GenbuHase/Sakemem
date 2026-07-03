import { beforeEach, describe, expect, it, vi } from "vitest";

const { revalidatePath } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath,
}));

import {
  revalidatePublicProfile,
  revalidatePublicRecord,
} from "./revalidate-public";

describe("revalidatePublicProfile", () => {
  beforeEach(() => {
    revalidatePath.mockClear();
  });

  it("revalidates both public URL forms", () => {
    revalidatePublicProfile("genbu");

    expect(revalidatePath).toHaveBeenCalledWith("/@genbu");
    expect(revalidatePath).toHaveBeenCalledWith("/profile/genbu");
    expect(revalidatePath).toHaveBeenCalledTimes(2);
  });

  it("revalidates old username when changed", () => {
    revalidatePublicProfile("newname", "oldname");

    expect(revalidatePath).toHaveBeenCalledWith("/@newname");
    expect(revalidatePath).toHaveBeenCalledWith("/profile/newname");
    expect(revalidatePath).toHaveBeenCalledWith("/@oldname");
    expect(revalidatePath).toHaveBeenCalledWith("/profile/oldname");
    expect(revalidatePath).toHaveBeenCalledTimes(4);
  });

  it("skips old username when unchanged", () => {
    revalidatePublicProfile("genbu", "genbu");

    expect(revalidatePath).toHaveBeenCalledTimes(2);
  });
});

describe("revalidatePublicRecord", () => {
  beforeEach(() => {
    revalidatePath.mockClear();
  });

  it("revalidates record and profile paths", () => {
    revalidatePublicRecord("genbu", "record-1");

    expect(revalidatePath).toHaveBeenCalledWith("/@genbu/record-1");
    expect(revalidatePath).toHaveBeenCalledWith("/profile/genbu/record-1");
    expect(revalidatePath).toHaveBeenCalledWith("/@genbu");
    expect(revalidatePath).toHaveBeenCalledWith("/profile/genbu");
    expect(revalidatePath).toHaveBeenCalledTimes(4);
  });
});
