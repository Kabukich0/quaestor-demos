#!/usr/bin/env node
/**
 * render.ts — orchestrate a Remotion render by phase name.
 *
 * Usage:
 *   tsx scripts/render.ts --phase 1.5a
 *
 * Auto-detects narration audio in public/. Prefers <phase>-narration.wav,
 * falls back to <phase>-narration.mp3, otherwise renders silent
 * (captions-only). Drop a file from any TTS service (ElevenLabs / Murf /
 * Play.HT / etc.) at one of those paths and re-run — no script wiring,
 * no API keys.
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

// Prefer wav (lossless intermediate, smaller composition concat artefacts);
// fall back to mp3 before going silent.
const wavName = `${phase}-narration.wav`;
const mp3Name = `${phase}-narration.mp3`;
const wavPath = resolve("public", wavName);
const mp3Path = resolve("public", mp3Name);

const args = ["exec", "remotion", "render", compositionId, outFile, "--concurrency=1"];

let narrationName: string | undefined;
if (existsSync(wavPath)) narrationName = wavName;
else if (existsSync(mp3Path)) narrationName = mp3Name;

if (narrationName) {
  console.log(`narration found at public/${narrationName} — including audio`);
  args.push("--props", JSON.stringify({ narrationSrc: narrationName }));
} else {
  console.log(
    `no narration at public/${wavName} or public/${mp3Name} — rendering silent (captions only)`,
  );
  console.log(
    `tip: generate audio in any TTS service (ElevenLabs / Murf / Play.HT) using narration/${phase}.txt as the script, drop it at one of the paths above, and re-run`,
  );
}

console.log(`rendering composition=${compositionId} → ${outFile}`);

const r = spawnSync("pnpm", args, { stdio: "inherit" });
process.exit(r.status ?? 1);
