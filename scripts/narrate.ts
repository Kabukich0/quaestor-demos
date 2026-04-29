#!/usr/bin/env node
/**
 * narrate.ts — Generate narration audio for a phase via Puter.js TTS.
 *
 * Usage:
 *   pnpm narrate -- --phase 1.5a
 *   pnpm narrate:1.5a
 *
 * Reads narration/<phase>.txt, drives Puter.js's window.puter.ai.txt2speech
 * inside a headless Chromium, and writes public/<phase>-narration.mp3.
 * Optionally transcodes to .wav via ffmpeg if available (Remotion can play
 * either; render.ts checks both extensions).
 *
 * Configuration (.env, all optional):
 *   PUTER_VOICE=Matthew      # any voice the Puter SDK exposes
 *   PUTER_ENGINE=neural      # standard | neural | generative
 *   PUTER_LANG=en-US
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { config } from "dotenv";
import { chromium } from "playwright";

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

const voice = process.env.PUTER_VOICE ?? "Matthew";
const engine = process.env.PUTER_ENGINE ?? "neural";
const language = process.env.PUTER_LANG ?? "en-US";

console.log(
  `narrating phase=${phase} via puter.js voice=${voice} engine=${engine} lang=${language} (${text.length} chars)`,
);

const PUTER_HTML = `<!doctype html>
<html><head><meta charset="utf-8"><title>puter-narrate</title>
<script src="https://js.puter.com/v2/"></script>
</head><body><p>narrate</p></body></html>`;

const main = async () => {
  const browser = await chromium.launch({ headless: true });
  let base64: string;
  try {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.setContent(PUTER_HTML, { waitUntil: "networkidle" });
    await page.waitForFunction(
      // biome-ignore lint/suspicious/noExplicitAny: window.puter is injected by SDK
      () => typeof (window as any).puter !== "undefined",
      undefined,
      { timeout: 15000 },
    );
    base64 = await page.evaluate(
      async ({ text, voice, engine, language }) => {
        // biome-ignore lint/suspicious/noExplicitAny: window.puter is injected by SDK
        const audio = await (window as any).puter.ai.txt2speech(text, {
          voice,
          engine,
          language,
        });
        const res = await fetch(audio.src);
        const buf = await res.arrayBuffer();
        let bin = "";
        const bytes = new Uint8Array(buf);
        const chunk = 0x8000;
        for (let i = 0; i < bytes.length; i += chunk) {
          bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
        }
        return btoa(bin);
      },
      { text, voice, engine, language },
    );
    await ctx.close();
  } finally {
    await browser.close();
  }

  const buf = Buffer.from(base64, "base64");
  const mp3Path = resolve(`public/${phase}-narration.mp3`);
  mkdirSync(dirname(mp3Path), { recursive: true });
  writeFileSync(mp3Path, buf);
  console.log(`wrote ${mp3Path} (${buf.length} bytes)`);

  const wavPath = resolve(`public/${phase}-narration.wav`);
  const ff = spawnSync("ffmpeg", ["-y", "-i", mp3Path, wavPath], {
    stdio: ["ignore", "ignore", "pipe"],
  });
  if (ff.status === 0) {
    console.log(`transcoded to ${wavPath}`);
  } else {
    console.log(
      "ffmpeg unavailable or failed; skipping wav transcode. Remotion can play mp3 directly, render.ts looks for wav OR mp3.",
    );
  }

  console.log(`now run: pnpm render:${phase}`);
};

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
