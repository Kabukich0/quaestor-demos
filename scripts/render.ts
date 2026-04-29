#!/usr/bin/env node
/**
 * render.ts — orchestrate a Remotion render by phase name.
 *
 * Usage:
 *   tsx scripts/render.ts --phase 1.5a
 *
 * Auto-detects public/<phase>-narration.wav and passes it as a Remotion prop
 * if present. Falls back to silent (captions-only) render otherwise.
 */

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const arg = (name: string): string | undefined => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const phase = arg("phase");
if (!phase) {
  console.error("usage: tsx scripts/render.ts --phase <name>");
  process.exit(1);
}

// "1.5a" -> "Phase15a"
const compositionId = "Phase" + phase.replace(/\./g, "");
const outFile = `out/phase-${phase}.mp4`;
const wavName = `${phase}-narration.wav`;
const wavPath = resolve("public", wavName);

const args = ["exec", "remotion", "render", compositionId, outFile, "--concurrency=1"];

if (existsSync(wavPath)) {
  console.log(`narration found at public/${wavName} — including audio`);
  args.push("--props", JSON.stringify({ narrationSrc: wavName }));
} else {
  console.log(`no narration at public/${wavName} — rendering silent (captions only)`);
  console.log(`tip: run 'pnpm narrate:${phase}' first if you want voiceover`);
}

console.log(`rendering composition=${compositionId} → ${outFile}`);

const r = spawnSync("pnpm", args, { stdio: "inherit" });
process.exit(r.status ?? 1);
