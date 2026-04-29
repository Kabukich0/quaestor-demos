#!/usr/bin/env node
/**
 * Optional fallback. For higher-quality narration, generate audio in a
 * third-party TTS service (ElevenLabs / Murf / Play.HT / etc.) using the
 * script in narration/<phase>.txt and drop the file into
 * public/<phase>-narration.{mp3,wav} directly — render.ts auto-detects
 * it. This script is only here for the lazy path.
 *
 * narrate.ts — Generate narration audio for a phase via Microsoft Edge TTS.
 *
 * Usage:
 *   pnpm narrate -- --phase 1.5a
 *   pnpm narrate:1.5a
 *
 * Reads narration/<phase>.txt, calls Edge's neural TTS over the
 * unauthenticated WebSocket the browser uses, and writes
 * public/<phase>-narration.mp3. Optional WAV transcode via ffmpeg.
 *
 * No auth, no browser, no API key. The msedge-tts package's `toFile` writes
 * to a directory with an auto-generated filename, so we use `toStream`
 * and pipe to the exact path render.ts expects.
 *
 * Configuration (.env, all optional):
 *   EDGE_VOICE=en-US-GuyNeural
 *   EDGE_RATE=+0%
 *   EDGE_PITCH=+0Hz
 */

import { spawnSync } from "node:child_process";
import { createWriteStream, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pipeline } from "node:stream/promises";
import { config } from "dotenv";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

config();

const arg = (name: string): string | undefined => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
};

const phase = arg("phase");
if (!phase) {
  console.error("usage: pnpm narrate -- --phase <name>");
  process.exit(1);
}

const scriptPath = resolve(`narration/${phase}.txt`);
if (!existsSync(scriptPath)) {
  console.error(`narration/${phase}.txt not found.`);
  process.exit(1);
}
const text = readFileSync(scriptPath, "utf8").trim();
if (!text) {
  console.error(`narration/${phase}.txt is empty.`);
  process.exit(1);
}

const voice = process.env.EDGE_VOICE ?? "en-US-GuyNeural";
const rate = process.env.EDGE_RATE ?? "+0%";
const pitch = process.env.EDGE_PITCH ?? "+0Hz";

console.log(`narrating phase=${phase} via edge-tts (voice=${voice}, ${text.length} chars)`);

const main = async () => {
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  const mp3Path = resolve(`public/${phase}-narration.mp3`);
  mkdirSync(dirname(mp3Path), { recursive: true });

  const { audioStream } = tts.toStream(text, { rate, pitch });
  const out = createWriteStream(mp3Path);
  await pipeline(audioStream, out);
  tts.close();

  console.log(`wrote ${mp3Path}`);

  const wavPath = resolve(`public/${phase}-narration.wav`);
  const ff = spawnSync("ffmpeg", ["-y", "-i", mp3Path, wavPath], {
    stdio: ["ignore", "ignore", "pipe"],
  });
  if (ff.status === 0) {
    console.log(`transcoded to ${wavPath}`);
  } else {
    console.log("ffmpeg not available; render.ts will use mp3 directly.");
  }

  console.log(`now run: pnpm render:${phase}`);
};

main().catch((e) => {
  process.stderr.write(`narrate failed: ${e instanceof Error ? e.stack ?? e.message : String(e)}\n`);
  process.exitCode = 1;
});
