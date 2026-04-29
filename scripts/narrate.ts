#!/usr/bin/env node
/**
 * narrate.ts — Generate narration WAV for a phase via ElevenLabs.
 *
 * Usage:
 *   pnpm narrate -- --phase 1.5a
 *   pnpm narrate:1.5a
 *
 * Reads narration/<phase>.txt, hits ElevenLabs, writes public/<phase>-narration.wav.
 * Requires ELEVENLABS_API_KEY in .env.
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";

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

const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("ELEVENLABS_API_KEY not set in .env");
  console.error("Skip narration: just run `pnpm render:" + phase + "` for a captioned-only video.");
  process.exit(1);
}

const voiceId = process.env.ELEVENLABS_VOICE_ID ?? "pNInz6obpgDQGcFmaJgB";

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

console.log(`narrating phase=${phase} via voice=${voiceId} (${text.length} chars)`);

const main = async () => {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "xi-api-key": apiKey,
      Accept: "audio/wav",
    },
    body: JSON.stringify({
      text,
      model_id: "eleven_turbo_v2_5",
      voice_settings: {
        stability: 0.55,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`elevenlabs error ${res.status}: ${body}`);
    process.exit(1);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  const out = resolve(`public/${phase}-narration.wav`);
  writeFileSync(out, buf);
  console.log(`wrote ${out} (${buf.length} bytes)`);
  console.log(`now run: pnpm render:${phase}`);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
