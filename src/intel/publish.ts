import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import platformsJson from "../data/platforms.json" with { type: "json" };
import matrixJson from "../data/quality-matrix.json" with { type: "json" };
import { DOMAIN_OBJECT_GRAPH } from "../domain/objects.js";
import { loadNoGateDoctrine } from "../domain/no-gate.js";
import type { PlatformsFile, QualityMatrix } from "./types.js";

export interface PublishResult {
  outDir: string;
  files: string[];
}

/** Publish permanent intel artifacts to .output/intel/ */
export async function publishIntel(
  outDir = path.resolve(process.cwd(), ".output/intel"),
): Promise<PublishResult> {
  const platforms = platformsJson as PlatformsFile;
  const matrix = matrixJson as QualityMatrix;
  const doctrine = loadNoGateDoctrine(matrix);

  await mkdir(outDir, { recursive: true });

  const stanceRollup = {
    copy: platforms.platforms.filter((p) => p.stance === "copy").map((p) => p.id),
    improve: platforms.platforms.filter((p) => p.stance === "improve").map((p) => p.id),
    avoid: platforms.platforms.filter((p) => p.stance === "avoid").map((p) => p.id),
  };

  const manifest = {
    product: matrix.product,
    publishedAt: new Date().toISOString(),
    platformCount: platforms.platforms.length,
    pillarCount: matrix.pillars.length,
    priorityCount: matrix.priorities.length,
    hardFailCount: matrix.hardFails.length,
    stanceRollup,
  };

  const files: Array<[string, unknown]> = [
    ["manifest.json", manifest],
    ["platforms.json", platforms],
    ["quality-matrix.json", matrix],
    ["no-gate-doctrine.json", doctrine],
    ["domain-object-graph.json", DOMAIN_OBJECT_GRAPH],
    [
      "priorities.md",
      matrix.priorities
        .map((p) => `## P${p.rank} — ${p.title}\n\n${p.outcome}\n`)
        .join("\n"),
    ],
  ];

  const written: string[] = [];
  for (const [name, body] of files) {
    const full = path.join(outDir, name);
    const text = typeof body === "string" ? body : `${JSON.stringify(body, null, 2)}\n`;
    await writeFile(full, text, "utf8");
    written.push(name);
  }

  return { outDir, files: written };
}
