import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { scoreFeature } from "../src/intel/score.js";
import type { FeatureInput } from "../src/intel/types.js";

async function loadFixture(name: string): Promise<FeatureInput> {
  const raw = await readFile(path.resolve("fixtures", name), "utf8");
  return JSON.parse(raw) as FeatureInput;
}

describe("feature scorer", () => {
  it("scores a strong feature as ship_eligible with credits applied", async () => {
    const feature = await loadFixture("sample-feature.json");
    const result = scoreFeature(feature);
    expect(result.vetoed).toBe(false);
    expect(result.gate).toBe("ship_eligible");
    expect(result.baseScore).toBe(91);
    expect(result.creditPoints).toBe(15);
    expect(result.totalScore).toBe(106);
    expect(result.costLedger?.totalFirstYear).toBe(4200 + 40 * 12 + 500);
  });

  it("vetoes credits — hard fails block ship even when credits apply", async () => {
    const feature = await loadFixture("veto-feature.json");
    const result = scoreFeature(feature);
    expect(result.vetoed).toBe(true);
    expect(result.gate).toBe("vetoed");
    expect(result.creditPoints).toBe(5);
    expect(result.totalScore).toBeGreaterThan(0);
    expect(result.vetoReasons.length).toBe(3);
  });

  it("routes mid scores to needs_review and low scores to draft", () => {
    const mid = scoreFeature({
      id: "mid",
      title: "Mid",
      summary: "x",
      dimensionScores: {
        pillarAlignment: 20,
        churnReduction: 10,
        priorityFit: 10,
        operatorClarity: 5,
        reversibility: 5,
      },
    });
    expect(mid.totalScore).toBe(50);
    expect(mid.gate).toBe("needs_review");

    const low = scoreFeature({
      id: "low",
      title: "Low",
      summary: "x",
      dimensionScores: {
        pillarAlignment: 10,
        churnReduction: 5,
        priorityFit: 5,
        operatorClarity: 2,
        reversibility: 2,
      },
    });
    expect(low.totalScore).toBe(24);
    expect(low.gate).toBe("draft");
  });
});
