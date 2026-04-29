#!/usr/bin/env node
/**
 * record-terminal.ts — wraps asciinema rec into a phase-named cast file.
 *
 * Usage:
 *   pnpm record:terminal -- --phase 1.5b
 *
 * Records to public/captures/<phase>-terminal.cast.
 * After recording, convert to GIF or MP4:
 *   agg public/captures/<phase>-terminal.cast public/captures/<phase>-terminal.gif
 *   ffmpeg -i public/captures/<phase>-terminal.gif public/captures/<phase>-terminal.mp4
 *
 * Then Remotion can <Video src={staticFile('captures/<phase>-terminal.mp4')} />.
 *
 * Requires: brew install asciinema agg ffmpeg
 */

import { spawnSync } from "node:child_process";
import { mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const arg = (name: string): string | undefined => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const phase = arg("phase");
if (!phase) {
  console.error("usage: pnpm record:terminal -- --phase <name>");
  process.exit(1);
}

// Verify asciinema is installed
const which = spawnSync("which", ["asciinema"], { encoding: "utf8" });
if (which.status !== 0) {
  console.error("asciinema not found. install with: brew install asciinema");
  process.exit(1);
}

const outDir = resolve("public/captures");
mkdirSync(outDir, { recursive: true });
const castPath = resolve(outDir, `${phase}-terminal.cast`);

if (existsSync(castPath)) {
  console.error(`${castPath} already exists. delete it first or use a different phase name.`);
  process.exit(1);
}

console.log(`recording terminal session for phase=${phase}`);
console.log(`output: ${castPath}`);
console.log(`press CTRL-D or type 'exit' to stop recording.`);
console.log("");

const r = spawnSync("asciinema", ["rec", castPath, "--idle-time-limit", "2"], {
  stdio: "inherit",
});

if (r.status !== 0) {
  console.error("asciinema recording failed");
  process.exit(r.status ?? 1);
}

console.log("");
console.log(`recording saved: ${castPath}`);
console.log("convert to MP4 for Remotion:");
console.log(`  agg ${castPath} ${outDir}/${phase}-terminal.gif`);
console.log(`  ffmpeg -i ${outDir}/${phase}-terminal.gif ${outDir}/${phase}-terminal.mp4`);
