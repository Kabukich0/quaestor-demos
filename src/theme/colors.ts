// Brutalist-technical palette.
// Dark base, monospaced, sharp-edged. Two accents only: one for "verified"
// (sodium green), one for "warning" (amber). No gradients.

export const colors = {
  // base
  ink: "#050507",          // near-black, almost UI-zero
  shadow: "#0c0c10",       // panel
  panel: "#13131a",        // raised surface
  border: "#1f1f29",       // hairline
  borderStrong: "#2d2d3a", // emphasis hairline

  // text
  textPrimary: "#f5f5f0",     // bone, not pure white
  textSecondary: "#8a8a99",   // mid grey
  textMuted: "#4a4a59",       // commentary
  textDim: "#2d2d3a",         // ghost

  // accents
  verified: "#32d583",     // sodium green — "approved", "signed", "settled"
  verifiedDim: "#1a4d2e",
  warning: "#fbbf24",      // amber — "advisory", "soft warn"
  warningDim: "#583e0a",
  reject: "#f87171",       // hard red — "rejected", "revoked"

  // signature accent for Quaestor itself
  brand: "#d4d4d0",        // off-bone, the only "color" associated with Quaestor
  brandSub: "#7a7a73",
} as const;

export type ColorToken = keyof typeof colors;
