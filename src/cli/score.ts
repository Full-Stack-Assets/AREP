#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import path from "node:path";
import { formatScoreReport, scoreFeature } from "../intel/score.js";
import type { FeatureInput } from "../intel/types.js";

async function main(): Promise<void> {
  const featurePath = process.argv[2];
  if (!featurePath) {
    console.error("Usage: npm run intel:score -- <feature.json>");
    process.exit(1);
  }
  const abs = path.resolve(process.cwd(), featurePath);
  const raw = await readFile(abs, "utf8");
  const feature = JSON.parse(raw) as FeatureInput;
  const result = scoreFeature(feature);
  console.log(formatScoreReport(result));
  if (result.vetoed) process.exitCode = 2;
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
