import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { publishIntel } from "../src/intel/publish.js";

describe("intel publisher", () => {
  it("writes intel artifacts to the output directory", async () => {
    const outDir = await mkdtemp(path.join(os.tmpdir(), "arep-intel-"));
    const result = await publishIntel(outDir);
    expect(result.files).toEqual(
      expect.arrayContaining([
        "manifest.json",
        "platforms.json",
        "quality-matrix.json",
        "no-gate-doctrine.json",
        "domain-object-graph.json",
        "priorities.md",
      ]),
    );
    const manifest = JSON.parse(await readFile(path.join(outDir, "manifest.json"), "utf8"));
    expect(manifest.platformCount).toBe(10);
    expect(manifest.priorityCount).toBe(5);
  });
});
