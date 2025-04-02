import { test, expect, describe } from "bun:test";
import { DEFAULT_MODEL, EMBEDDING_MODEL } from "./provider";

describe("AI Provider", () => {
  test("DEFAULT_MODEL should be defined", () => {
    expect(DEFAULT_MODEL).toBeDefined();
    expect(typeof DEFAULT_MODEL).toBe("string");
    expect(DEFAULT_MODEL).toBe("gpt-4o-mini");
  });

  test("EMBEDDING_MODEL should be defined", () => {
    expect(EMBEDDING_MODEL).toBeDefined();
    expect(typeof EMBEDDING_MODEL).toBe("string");
    expect(EMBEDDING_MODEL).toBe("text-embedding-3-small");
  });

  test("models should match expected values", () => {
    // This ensures if models are changed, the tests will catch it
    expect(DEFAULT_MODEL).toMatch(/gpt-4/);
    expect(EMBEDDING_MODEL).toMatch(/text-embedding/);
  });
});
