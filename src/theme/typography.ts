// Two faces only.
// Display: IBM Plex Mono (free, distinctive, technical). Loaded via Google Fonts
// in the composition's <Html> head — but Remotion ships fonts via @remotion/google-fonts
// in production. For Path A self-contained, we fall back to system mono if not loaded.
//
// The aesthetic intention: this is a TERMINAL that became cinematic. No sans body.
// Everything is monospace. Hierarchy comes from weight, size, and color — not face.

export const typography = {
  fontFamily: `"JetBrains Mono", "IBM Plex Mono", "Berkeley Mono", "SF Mono", "Menlo", "Consolas", monospace`,

  // sizes (px) — tuned for 1920x1080
  display: 96,    // title cards
  h1: 64,         // section heads
  h2: 44,         // captions
  body: 28,       // commentary
  code: 22,       // terminal output, addresses
  micro: 16,      // timestamps, labels

  // weights (Plex Mono ships 100-700)
  thin: 200,
  regular: 400,
  medium: 500,
  bold: 700,

  // letter spacing — tight for display, loose for micro
  trackingTight: "-0.02em",
  trackingNormal: "0em",
  trackingLoose: "0.08em",
  trackingMicro: "0.18em",  // for "PHASE 1.5A" / "BASE SEPOLIA" labels
} as const;
