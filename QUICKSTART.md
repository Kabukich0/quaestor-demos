# Quickstart — Phase 1.5a demo, today

You shipped Phase 1.5a. You want a demo video on Twitter/X in the next hour. Three options, fastest first.

## Option 1: Pure Remotion (fastest, ~5 minutes after install)

```
cd ~/code/quaestor-demos
nvm use 22
pnpm install
pnpm render:1.5a
open out/phase-1.5a.mp4
```

That's it. ~90s video with captions, the real Basescan tx hash, the actual settlement address. No external setup, no API keys.

If it looks good, post it. Done.

## Option 2: Add narration (~10 more minutes)

If you want voice narration:

1. Generate narration in your TTS service of choice (ElevenLabs, Murf, Play.HT, or similar — voice quality is significantly better than Edge neural) using the script in `narration/1.5a.txt`. That file is the source of truth — edit it there if you want to change the narration.
2. Save the output as `public/1.5a-narration.mp3` or `public/1.5a-narration.wav`.
3. `pnpm render:1.5a` — Remotion picks up the audio automatically.

## Option 3: Real screen capture (~20 minutes, highest fidelity)

If you want actual scrolling Basescan + actual daemon logs instead of the stylized version:

```
chmod +x scripts/quickrec-1.5a.sh
./scripts/quickrec-1.5a.sh
```

This drives macOS's `screencapture` against your real terminal + your real browser at the real tx URL. Output is `out/phase-1.5a-captured.mp4`. Caveats:

- macOS only.
- Needs Screen Recording permission on the terminal you run it from.
- Less polished than Option 1 — no captions, no narration, no transitions. Raw screen capture.

For investor emails and social, **Option 1 wins.** Option 3 is for "look at this real thing happening" credibility shots inside a longer pitch.

## Posting it

Tweet copy starting point:

> shipped: ai agent → mandate jwt → real on-chain x402 payment on base sepolia
>
> bridge holds zero keys. core's hd vault signs. 36 hrs from spec to live tx.
>
> [basescan link]
>
> [video reply]

Adjust to your voice. Drop it on X, LinkedIn if you have a presence, Show HN if you want the dev wave.
