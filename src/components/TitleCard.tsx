import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

interface TitleCardProps {
  eyebrow: string;        // e.g. "PHASE 1.5A"
  title: string;          // e.g. "Real on-chain settlement"
  subtitle?: string;      // e.g. "BASE SEPOLIA — APR 2026"
}

export const TitleCard: React.FC<TitleCardProps> = ({ eyebrow, title, subtitle }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  // entry: 0-15f staggered fade
  const eyebrowOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const eyebrowY = interpolate(frame, [0, 18], [12, 0], { extrapolateRight: "clamp" });
  const titleOpacity = interpolate(frame, [8, 24], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [8, 28], [16, 0], { extrapolateRight: "clamp" });
  const subtitleOpacity = interpolate(frame, [16, 30], [0, 1], { extrapolateRight: "clamp" });

  // exit: last 12f fade everything
  const exitStart = durationInFrames - 12;
  const exitOpacity = interpolate(frame, [exitStart, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // crosshair tick lines that animate in
  const tickProgress = interpolate(frame, [4, 28], [0, 1], { extrapolateRight: "clamp" });
  const tickWidth = 80 * tickProgress;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.ink,
        fontFamily: typography.fontFamily,
        opacity: exitOpacity,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingLeft: 160,
        paddingRight: 160,
      }}
    >
      {/* Crosshair marker */}
      <div
        style={{
          position: "absolute",
          top: 160,
          left: 160,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ width: tickWidth, height: 1, backgroundColor: colors.brandSub }} />
        <div
          style={{
            width: 6,
            height: 6,
            backgroundColor: colors.verified,
            opacity: tickProgress,
          }}
        />
      </div>

      {/* Eyebrow */}
      <div
        style={{
          color: colors.brandSub,
          fontSize: typography.micro,
          fontWeight: typography.medium,
          letterSpacing: typography.trackingMicro,
          opacity: eyebrowOpacity,
          transform: `translateY(${eyebrowY}px)`,
          marginBottom: 32,
        }}
      >
        {eyebrow}
      </div>

      {/* Title */}
      <div
        style={{
          color: colors.textPrimary,
          fontSize: typography.display,
          fontWeight: typography.thin,
          letterSpacing: typography.trackingTight,
          lineHeight: 1.05,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          maxWidth: 1400,
        }}
      >
        {title}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div
          style={{
            color: colors.textSecondary,
            fontSize: typography.body,
            fontWeight: typography.regular,
            letterSpacing: typography.trackingLoose,
            opacity: subtitleOpacity,
            marginTop: 40,
          }}
        >
          {subtitle}
        </div>
      )}

      {/* Bottom rule */}
      <div
        style={{
          position: "absolute",
          bottom: 160,
          left: 160,
          right: 160,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          opacity: subtitleOpacity,
        }}
      >
        <div
          style={{
            color: colors.textMuted,
            fontSize: typography.micro,
            letterSpacing: typography.trackingMicro,
          }}
        >
          QUAESTOR / MANDATE ENGINE
        </div>
        <div
          style={{
            color: colors.textMuted,
            fontSize: typography.micro,
            letterSpacing: typography.trackingMicro,
          }}
        >
          {Math.floor(frame / fps).toString().padStart(2, "0")} : {(frame % fps).toString().padStart(2, "0")}
        </div>
      </div>
    </AbsoluteFill>
  );
};
