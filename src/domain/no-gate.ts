import type { QualityMatrix } from "../intel/types.js";

/**
 * No-gate doctrine: authorization and operator decisions are hard;
 * product theater gates that compress uncertainty are forbidden.
 */
export interface NoGateDoctrine {
  summary: string;
  allowed: string[];
  forbidden: string[];
}

export function loadNoGateDoctrine(matrix: QualityMatrix): NoGateDoctrine {
  return {
    summary: matrix.doctrine.noGate,
    allowed: [
      "Authorization checks that reject unauthorized intake",
      "Operator decisions at the action boundary",
      "Conflict review queues that preserve competing evidence",
      "Underwriting refusals that log blocks instead of guessing",
    ],
    forbidden: [
      "Stage gates that auto-pass without inspecting evidence",
      "Approval checklists that do not change the operating record",
      "Composite scores used as silent ship authority",
      "Automation that crosses offer/contract/assign/outreach without a human",
    ],
  };
}

export function isGateTheater(description: string): boolean {
  const lowered = description.toLowerCase();
  const theaterSignals = [
    "rubber stamp",
    "auto-approve without evidence",
    "checkbox approval",
    "stage theater",
    "fake gate",
  ];
  return theaterSignals.some((s) => lowered.includes(s));
}
