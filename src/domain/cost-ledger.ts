/**
 * Dollar cost ledger stubs — every feature ships with explicit dollars.
 */

export interface CostLedgerEntry {
  featureId: string;
  buildUsd: number;
  runMonthlyUsd: number;
  riskReserveUsd: number;
  currency: "USD";
  notes?: string;
}

export function createCostLedgerStub(
  featureId: string,
  costs: { build: number; runMonthly: number; riskReserve: number },
  notes?: string,
): CostLedgerEntry {
  if (costs.build < 0 || costs.runMonthly < 0 || costs.riskReserve < 0) {
    throw new Error("Cost ledger amounts must be non-negative");
  }
  return {
    featureId,
    buildUsd: costs.build,
    runMonthlyUsd: costs.runMonthly,
    riskReserveUsd: costs.riskReserve,
    currency: "USD",
    notes,
  };
}

export function firstYearTotal(entry: CostLedgerEntry): number {
  return entry.buildUsd + entry.runMonthlyUsd * 12 + entry.riskReserveUsd;
}
