import { describe, expect, it } from "vitest";
import platforms from "../src/data/platforms.json" with { type: "json" };
import matrix from "../src/data/quality-matrix.json" with { type: "json" };

describe("permanent intel data", () => {
  it("seeds ten platforms and a complete quality matrix", () => {
    expect(platforms.platforms).toHaveLength(10);
    const stances = new Set(platforms.platforms.map((p) => p.stance));
    expect(stances.has("copy")).toBe(true);
    expect(stances.has("improve")).toBe(true);
    expect(stances.has("avoid")).toBe(true);

    expect(matrix.pillars.length).toBeGreaterThanOrEqual(5);
    expect(matrix.churnDrivers.length).toBeGreaterThanOrEqual(5);
    expect(matrix.priorities).toHaveLength(5);
    expect(matrix.priorities.map((p) => p.rank)).toEqual([1, 2, 3, 4, 5]);
    expect(matrix.scoringDimensions.length).toBeGreaterThanOrEqual(5);
    expect(matrix.hardFails.length).toBeGreaterThanOrEqual(5);
    const dimMax = matrix.scoringDimensions.reduce((s, d) => s + d.max, 0);
    expect(dimMax).toBe(100);
  });
});
