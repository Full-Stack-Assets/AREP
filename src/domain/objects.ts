/**
 * Domain object graph for Tradewind DealFlow operating records.
 * Stubs encode the permanent relationships quality features must respect.
 */

export type RecordState =
  | "incomplete_intake"
  | "ready_for_review"
  | "in_conflict"
  | "operator_decided"
  | "follow_up_controlled"
  | "dead";

export interface SourceRef {
  sourceId: string;
  channel: "authorized_list" | "assessor" | "field_note" | "operator";
  pulledAt: string;
  externalRecordId?: string;
}

export interface ProvenancedValue<T> {
  value: T;
  source: SourceRef;
}

export interface Conflict<T> {
  field: string;
  candidates: ProvenancedValue<T>[];
  status: "open" | "resolved" | "deferred";
  resolvedBy?: string;
}

export interface OperatorDecision {
  decidedAt: string;
  operatorId: string;
  action: "offer" | "contract" | "assign" | "outreach" | "defer" | "kill";
  rationale: string;
}

export interface DealRecord {
  id: string;
  state: RecordState;
  fields: Record<string, ProvenancedValue<unknown>>;
  conflicts: Conflict<unknown>[];
  decisions: OperatorDecision[];
}

export interface DomainObjectGraph {
  objects: string[];
  edges: Array<{ from: string; to: string; relation: string }>;
  invariants: string[];
}

/** Permanent object graph — features must not violate these edges. */
export const DOMAIN_OBJECT_GRAPH: DomainObjectGraph = {
  objects: [
    "AuthorizedChannel",
    "SourceRef",
    "ProvenancedValue",
    "DealRecord",
    "Conflict",
    "OperatorDecision",
    "UnderwritingBlock",
    "CostLedgerEntry",
    "AuditEvent",
  ],
  edges: [
    { from: "AuthorizedChannel", to: "SourceRef", relation: "admits" },
    { from: "SourceRef", to: "ProvenancedValue", relation: "grounds" },
    { from: "ProvenancedValue", to: "DealRecord", relation: "populates" },
    { from: "DealRecord", to: "Conflict", relation: "may_open" },
    { from: "Conflict", to: "OperatorDecision", relation: "requires" },
    { from: "OperatorDecision", to: "DealRecord", relation: "advances" },
    { from: "DealRecord", to: "UnderwritingBlock", relation: "may_emit" },
    { from: "DealRecord", to: "AuditEvent", relation: "emits" },
    { from: "CostLedgerEntry", to: "DealRecord", relation: "prices_feature_for" },
  ],
  invariants: [
    "No ProvenancedValue without SourceRef.",
    "No action-boundary transition without OperatorDecision.",
    "Open Conflict blocks offer/contract/assign/outreach.",
    "UnderwritingBlock is logged, never replaced with a fabricated value.",
    "Re-ingest is idempotent on externalRecordId within a channel.",
  ],
};

export function assertGraphIntegrity(graph: DomainObjectGraph = DOMAIN_OBJECT_GRAPH): void {
  const ids = new Set(graph.objects);
  for (const edge of graph.edges) {
    if (!ids.has(edge.from) || !ids.has(edge.to)) {
      throw new Error(`Graph edge references unknown object: ${edge.from} -> ${edge.to}`);
    }
  }
}
