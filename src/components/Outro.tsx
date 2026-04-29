import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

interface OutroProps {
  claim: string;          // "Bridge held zero keys."
  subClaim?: string;      // "Quaestor — the only mandate engine that means it."
  cta?: string;           // "github.com/Kabukich0/quaestor-core"
}

export const Outro: React.FC<OutroProps> = ({ claim, subClaim, cta }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const claimOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const claimY = interpolate(frame, [0, 28], [20, 0], { extrapolateRight: "clamp" });

  const subOpacity = interpolate(frame, [16, 36], [0, 1], { extrapolateRight: "clamp" });

  const ctaOpacity = interpolate(frame, [28, 48], [0, 1], { extrapolateRight: "clamp" });

  // exit fade
  const exitStart = durationInFrames - 12;
  const exitOpacity = interpolate(frame, [exitStart, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // animated underline beneath claim
  const ulProgress = interpolate(frame, [12, 40], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.ink,
        fontFamily: typography.fontFamily,
        opacity: exitOpacity,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 160,
      }}
    >
      <div
        style={{
          color: colors.textPrimary,
          fontSize: typography.display,
          fontWeight: typography.thin,
          letterSpacing: typography.trackingTight,
          textAlign: "center",
          opacity: claimOpacity,
          transform: `translateY(${claimY}px)`,
          maxWidth: 1600,
          lineHeight: 1.05,
        }}
      >
        {claim}
      </div>

      <div
        style={{
          width: 320 * ulProgress,
          height: 2,
          backgroundColor: colors.verified,
          marginTop: 48,
          marginBottom: 48,
        }}
      />

      {subClaim && (
        <div
          style={{
            color: colors.textSecondary,
            fontSize: typography.body,
            fontWeight: typography.regular,
            letterSpacing: typography.trackingTight,
            textAlign: "center",
            opacity: subOpacity,
            maxWidth: 1200,
          }}
        >
          {subClaim}
        </div>
      )}

      {cta && (
        <div
          style={{
            position: "absolute",
            bottom: 120,
            color: colors.brandSub,
            fontSize: typography.micro,
            letterSpacing: typography.trackingMicro,
            opacity: ctaOpacity,
          }}
        >
          {cta}
        </div>
      )}
    </AbsoluteFill>
  );
};
