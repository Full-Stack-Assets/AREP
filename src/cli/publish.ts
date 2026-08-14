#!/usr/bin/env node
import { publishIntel } from "../intel/publish.js";

async function main(): Promise<void> {
  const result = await publishIntel();
  console.log(`Published ${result.files.length} intel artifacts → ${result.outDir}`);
  for (const f of result.files) console.log(`  - ${f}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
