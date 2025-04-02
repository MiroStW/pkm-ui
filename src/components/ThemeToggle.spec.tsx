/// <reference lib="dom" />

import { describe, test, expect, spyOn } from "bun:test";
import * as NextThemes from "next-themes";
import { ThemeToggle } from "./ThemeToggle";
import { render } from "@testing-library/react";

describe("ThemeToggle Component", () => {
  test("renders the theme toggle button", () => {
    spyOn(NextThemes, "useTheme").mockReturnValue({
      theme: "light",
      setTheme: () => null,
      themes: ["light", "dark"],
    });
    const { container } = render(<ThemeToggle />);

    // Verify the theme icons are present
    expect(container.querySelector(".lucide-sun")).toBeTruthy();
    expect(container.querySelector(".lucide-moon")).toBeTruthy();
    expect(container.querySelector(".sr-only")).toBeTruthy();
  });
});
