import { describe, it, expect } from "bun:test";
import { cn } from "./utils";

describe("cn utility", () => {
  it("should merge class names correctly", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
    expect(cn("class1", { class2: true, class3: false })).toBe("class1 class2");
    expect(cn("p-4", "mt-2", "bg-blue-500")).toBe("p-4 mt-2 bg-blue-500");
  });

  it("should merge tailwind classes properly with tailwind-merge", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    expect(cn("bg-red-500", { "bg-blue-500": true })).toBe("bg-blue-500");
  });
});
