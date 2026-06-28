import { describe, expect, it } from "vitest";
import { validateUsernameFormat } from "./validate-username";

describe("validateUsernameFormat", () => {
  it("accepts valid usernames", () => {
    expect(validateUsernameFormat("genbu")).toBeNull();
    expect(validateUsernameFormat("user_123")).toBeNull();
    expect(validateUsernameFormat("abc")).toBeNull();
  });

  it("rejects invalid usernames", () => {
    expect(validateUsernameFormat("")).not.toBeNull();
    expect(validateUsernameFormat("ab")).not.toBeNull();
    expect(validateUsernameFormat("a".repeat(31))).not.toBeNull();
    expect(validateUsernameFormat("user name")).not.toBeNull();
    expect(validateUsernameFormat("ユーザー")).not.toBeNull();
  });
});
