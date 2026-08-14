import { describe, expect, it } from "vitest";
import { createCostLedgerStub, firstYearTotal } from "../src/domain/cost-ledger.js";
import { isGateTheater, loadNoGateDoctrine } from "../src/domain/no-gate.js";
import { assertGraphIntegrity, DOMAIN_OBJECT_GRAPH } from "../src/domain/objects.js";
import { getMatrix } from "../src/intel/score.js";

describe("domain stubs", () => {
  it("keeps a coherent domain object graph", () => {
    expect(() => assertGraphIntegrity(DOMAIN_OBJECT_GRAPH)).not.toThrow();
    expect(DOMAIN_OBJECT_GRAPH.invariants.length).toBeGreaterThanOrEqual(4);
  });

  it("loads no-gate doctrine and detects gate theater", () => {
    const doctrine = loadNoGateDoctrine(getMatrix());
    expect(doctrine.forbidden.length).toBeGreaterThan(0);
    expect(isGateTheater("checkbox approval with no evidence")).toBe(true);
    expect(isGateTheater("operator decision on conflict queue")).toBe(false);
  });

  it("builds dollar cost ledger stubs with first-year totals", () => {
    const entry = createCostLedgerStub("x", { build: 1000, runMonthly: 100, riskReserve: 200 });
    expect(firstYearTotal(entry)).toBe(1000 + 1200 + 200);
    expect(() => createCostLedgerStub("bad", { build: -1, runMonthly: 0, riskReserve: 0 })).toThrow();
  });
});
