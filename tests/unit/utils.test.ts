import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins class names and skips falsy values", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });

  it("lets the last conflicting Tailwind utility win", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("keeps the custom type scale alongside a text colour", () => {
    // Regression guard: without the custom tailwind-merge config, `text-display`
    // is mistaken for a colour and removed when `text-foreground` follows it.
    expect(cn("text-display", "text-foreground")).toBe("text-display text-foreground");
  });

  it("still resolves conflicts between two custom type sizes", () => {
    expect(cn("text-title", "text-heading")).toBe("text-heading");
  });
});
