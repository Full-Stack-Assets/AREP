/** Shared intel types for scoring and publishing. */

export type Stance = "copy" | "improve" | "avoid";

export interface Platform {
  id: string;
  name: string;
  category: string;
  stance: Stance;
  summary: string;
  copy: string[];
  improve: string[];
  avoid: string[];
}

export interface PlatformsFile {
  product: string;
  purpose: string;
  updated: string;
  platforms: Platform[];
}

export interface Pillar {
  id: string;
  name: string;
  weight: number;
  description: string;
}

export interface ChurnDriver {
  id: string;
  name: string;
  severity: string;
}

export interface Priority {
  rank: number;
  id: string;
  title: string;
  outcome: string;
}

export interface ScoringDimension {
  id: string;
  name: string;
  max: number;
  description: string;
}

export interface HardFail {
  id: string;
  description: string;
}

export interface CreditDef {
  id: string;
  points: number;
  description: string;
}

export interface QualityMatrix {
  product: string;
  version: string;
  updated: string;
  doctrine: {
    noGate: string;
    provenance: string;
    actionBoundary: string;
  };
  pillars: Pillar[];
  churnDrivers: ChurnDriver[];
  priorities: Priority[];
  scoringDimensions: ScoringDimension[];
  hardFails: HardFail[];
  approvalGates: {
    autoApproveMax: number;
    reviewMin: number;
    shipMin: number;
    rules: string[];
  };
  credits: {
    maxTotal: number;
    catalog: CreditDef[];
  };
}

export type DimensionScores = Record<string, number>;

export interface FeatureInput {
  id: string;
  title: string;
  summary: string;
  pillarIds?: string[];
  churnDriverIds?: string[];
  priorityRank?: number;
  dimensionScores: DimensionScores;
  creditIds?: string[];
  hardFailIds?: string[];
  estimatedCostUsd?: {
    build: number;
    runMonthly: number;
    riskReserve: number;
  };
}

export type ApprovalGate = "draft" | "needs_review" | "ship_eligible" | "vetoed";

export interface ScoreResult {
  featureId: string;
  title: string;
  baseScore: number;
  creditPoints: number;
  totalScore: number;
  vetoed: boolean;
  vetoReasons: string[];
  gate: ApprovalGate;
  dimensionBreakdown: Array<{ id: string; awarded: number; max: number }>;
  creditsApplied: Array<{ id: string; points: number }>;
  costLedger: {
    build: number;
    runMonthly: number;
    riskReserve: number;
    totalFirstYear: number;
  } | null;
}
