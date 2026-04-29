import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

interface CaptionProps {
  label?: string;          // small uppercase label, e.g. "STEP 02 / SIGN"
  text: string;            // the actual caption
  variant?: "default" | "verified" | "warning" | "reject";
  position?: "bottom" | "top";
}

export const Caption: React.FC<CaptionProps> = ({
  label,
  text,
  variant = "default",
  position = "bottom",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const accent = {
    default: colors.brandSub,
    verified: colors.verified,
    warning: colors.warning,
    reject: colors.reject,
  }[variant];

  // entry: 0-12f
  const entryOpacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const entryX = interpolate(frame, [0, 14], [-24, 0], { extrapolateRight: "clamp" });

  // exit: last 8f
  const exitStart = durationInFrames - 8;
  const exitOpacity = interpolate(frame, [exitStart, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // ticking width animation on the accent bar
  const barProgress = interpolate(frame, [6, 24], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        [position]: 120,
        left: 120,
        right: 120,
        opacity: entryOpacity * exitOpacity,
        transform: `translateX(${entryX}px)`,
        fontFamily: typography.fontFamily,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 64 * barProgress,
            height: 2,
            backgroundColor: accent,
          }}
        />
        {label && (
          <div
            style={{
              color: accent,
              fontSize: typography.micro,
              fontWeight: typography.medium,
              letterSpacing: typography.trackingMicro,
            }}
          >
            {label}
          </div>
        )}
      </div>

      <div
        style={{
          color: colors.textPrimary,
          fontSize: typography.h2,
          fontWeight: typography.regular,
          letterSpacing: typography.trackingTight,
          lineHeight: 1.2,
          maxWidth: 1400,
        }}
      >
        {text}
      </div>
    </div>
  );
};
