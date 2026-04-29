# quaestor-demos

[![CI](https://github.com/Kabukich0/quaestor-demos/actions/workflows/ci.yml/badge.svg)](https://github.com/Kabukich0/quaestor-demos/actions/workflows/ci.yml)

Programmatic demo videos for Quaestor milestones. Two paths:

- **Path A — Remotion only.** Pure code, no external recording. `pnpm render:1.5a` → `out/phase-1.5a.mp4`. No Playwright, no asciinema, no API keys. Ships a usable demo today.
- **Path B — Captured pipeline.** Playwright records a real Basescan tour, asciinema records a real terminal session, ElevenLabs generates narration, Remotion stitches everything. Higher fidelity, more setup. Use when you want to show actual on-chain activity instead of the stylized version.

## Layout

```
src/
  Root.tsx                    Remotion entry — registers compositions
  compositions/
    Phase15a.tsx              90s demo for Phase 1.5a (Path A — self-contained)
    _PhaseTemplate.tsx        Copy this for future phases
  components/                 Reusable: TitleCard, Caption, Terminal, BasescanFrame, Outro
  theme/                      Colors + typography tokens
scripts/
  quickrec-1.5a.sh            Path B macOS quickstart (screencapture + ffmpeg)
  record-terminal.ts          Path B asciinema wrapper
  record-browser.ts           Path B Playwright Basescan tour
  narrate.ts                  Path B ElevenLabs script-to-WAV
  render.ts                   Path B Remotion orchestrator
narration/
  1.5a.txt                    Voiceover script for Phase 1.5a
```

## Path A — render Phase 1.5a today (zero setup)

```
nvm use 22
pnpm install
pnpm render:1.5a
```

Output: `out/phase-1.5a.mp4`, ~90 seconds, narrated captions, ready for Twitter/X.

If you want narration audio: generate it in any third-party TTS service (ElevenLabs free tier, Murf, Play.HT, or similar — voice quality is significantly better than Edge neural). Save the file as `public/<phase>-narration.mp3` or `.wav`. Then run `pnpm render:<phase>` and the renderer will pick it up automatically.

## Path B — capture real activity (Phase 1.5b+ workflow)

```
brew install asciinema agg ffmpeg
pnpm install
pnpm playwright install chromium

# 1. Edit narration/<phase>.txt
# 2. Capture terminal + browser
pnpm record:terminal -- --phase 1.5b
pnpm record:browser  -- --phase 1.5b --tx <basescan-tx-hash>
# 3. Optional: generate narration
pnpm narrate -- --phase 1.5b
# 4. Render
pnpm render -- --phase 1.5b
```

Output: `out/phase-<n>.mp4`.

## Adding a new phase

1. Copy `src/compositions/_PhaseTemplate.tsx` to `Phase{N}.tsx`.
2. Register it in `src/Root.tsx`.
3. Write `narration/{N}.txt`.
4. Add a `render:{N}` script to `package.json`.
5. Run.

15 minutes per phase once the pipeline exists. The point.

## License

MIT — same as the rest of Quaestor.
