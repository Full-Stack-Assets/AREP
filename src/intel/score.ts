import matrixJson from "../data/quality-matrix.json" with { type: "json" };
import { createCostLedgerStub, firstYearTotal } from "../domain/cost-ledger.js";
import type {
  ApprovalGate,
  FeatureInput,
  QualityMatrix,
  ScoreResult,
} from "./types.js";

const matrix = matrixJson as QualityMatrix;

export function getMatrix(): QualityMatrix {
  return matrix;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function resolveGate(
  total: number,
  vetoed: boolean,
  gates: QualityMatrix["approvalGates"],
): ApprovalGate {
  if (vetoed) return "vetoed";
  if (total >= gates.shipMin) return "ship_eligible";
  if (total >= gates.reviewMin) return "needs_review";
  return "draft";
}

/** Score a feature against the permanent quality matrix. Credits never clear a veto. */
export function scoreFeature(
  feature: FeatureInput,
  mtx: QualityMatrix = matrix,
): ScoreResult {
  const vetoReasons: string[] = [];
  const hardFailIds = new Set(feature.hardFailIds ?? []);
  for (const fail of mtx.hardFails) {
    if (hardFailIds.has(fail.id)) {
      vetoReasons.push(`${fail.id}: ${fail.description}`);
    }
  }

  const dimensionBreakdown: ScoreResult["dimensionBreakdown"] = [];
  let baseScore = 0;
  for (const dim of mtx.scoringDimensions) {
    const raw = feature.dimensionScores[dim.id] ?? 0;
    const awarded = clamp(raw, 0, dim.max);
    dimensionBreakdown.push({ id: dim.id, awarded, max: dim.max });
    baseScore += awarded;
  }

  const creditCatalog = new Map(mtx.credits.catalog.map((c) => [c.id, c]));
  const creditsApplied: ScoreResult["creditsApplied"] = [];
  let creditPoints = 0;
  for (const id of feature.creditIds ?? []) {
    const def = creditCatalog.get(id);
    if (!def) continue;
    creditsApplied.push({ id: def.id, points: def.points });
    creditPoints += def.points;
  }
  creditPoints = Math.min(creditPoints, mtx.credits.maxTotal);

  const totalScore = baseScore + creditPoints;
  const vetoed = vetoReasons.length > 0;
  // Credits may raise score but cannot clear a veto.
  const gate = resolveGate(totalScore, vetoed, mtx.approvalGates);

  let costLedger: ScoreResult["costLedger"] = null;
  if (feature.estimatedCostUsd) {
    const entry = createCostLedgerStub(feature.id, feature.estimatedCostUsd);
    costLedger = {
      build: entry.buildUsd,
      runMonthly: entry.runMonthlyUsd,
      riskReserve: entry.riskReserveUsd,
      totalFirstYear: firstYearTotal(entry),
    };
  }

  return {
    featureId: feature.id,
    title: feature.title,
    baseScore,
    creditPoints,
    totalScore,
    vetoed,
    vetoReasons,
    gate,
    dimensionBreakdown,
    creditsApplied,
    costLedger,
  };
}

export function formatScoreReport(result: ScoreResult): string {
  const lines = [
    `Feature: ${result.title} (${result.featureId})`,
    `Base: ${result.baseScore}  Credits: ${result.creditPoints}  Total: ${result.totalScore}`,
    `Gate: ${result.gate}${result.vetoed ? " (VETO)" : ""}`,
  ];
  if (result.vetoReasons.length) {
    lines.push("Vetoes:");
    for (const r of result.vetoReasons) lines.push(`  - ${r}`);
  }
  lines.push("Dimensions:");
  for (const d of result.dimensionBreakdown) {
    lines.push(`  - ${d.id}: ${d.awarded}/${d.max}`);
  }
  if (result.creditsApplied.length) {
    lines.push("Credits:");
    for (const c of result.creditsApplied) lines.push(`  - ${c.id}: +${c.points}`);
  }
  if (result.costLedger) {
    const c = result.costLedger;
    lines.push(
      `Cost ledger: build $${c.build} / run $${c.runMonthly}/mo / risk $${c.riskReserve} / Y1 $${c.totalFirstYear}`,
    );
  }
  return lines.join("\n");
}
