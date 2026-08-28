import { describe, expect, test } from "bun:test";
import { validateCacheOptions } from "./validate-cache-options";

describe("page/validateCacheOptions", () => {
  test("accepts undefined and boolean cache options", () => {
    expect(() => validateCacheOptions(undefined)).not.toThrow();
    expect(() => validateCacheOptions(true)).not.toThrow();
    expect(() => validateCacheOptions(false)).not.toThrow();
  });

  test("throws when ttl is non-positive", () => {
    expect(() => validateCacheOptions({ ttl: 0 })).toThrow(TypeError);
    expect(() => validateCacheOptions({ ttl: -1 })).toThrow(TypeError);
  });
});
