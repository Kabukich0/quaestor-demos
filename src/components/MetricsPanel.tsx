import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

interface Stat {
  value: string;
  label: string;
  accent?: "verified" | "default" | "warning" | "reject";
}

interface MetricsPanelProps {
  /** small uppercase label above the panel, e.g. "EVAL RESULTS / 60 HAND-LABELED CASES" */
  eyebrow: string;
  /** the killer headline number, displayed massive, e.g. "0%" */
  headline: string;
  /** what the headline measures, displayed below in small uppercase */
  headlineLabel: string;
  /** supporting stats grid (3-5 stats max) */
  stats: Stat[];
  /** optional bottom-right caption */
  caption?: string;
}

const accentColor = (accent?: Stat["accent"]) => {
  switch (accent) {
    case "verified": return colors.verified;
    case "warning": return colors.warning;
    case "reject": return colors.reject;
    default: return colors.textPrimary;
  }
};

export const MetricsPanel: React.FC<MetricsPanelProps> = ({
  eyebrow,
  headline,
  headlineLabel,
  stats,
  caption,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // entry timings
  const eyebrowOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const eyebrowX = interpolate(frame, [0, 22], [-24, 0], { extrapolateRight: "clamp" });

  const headlineOpacity = interpolate(frame, [12, 36], [0, 1], { extrapolateRight: "clamp" });
  const headlineY = interpolate(frame, [12, 40], [40, 0], { extrapolateRight: "clamp" });

  // Subtle scale-in on the headline number for impact
  const headlineScale = interpolate(frame, [12, 50], [0.94, 1], { extrapolateRight: "clamp" });

  const headlineLabelOpacity = interpolate(frame, [28, 48], [0, 1], { extrapolateRight: "clamp" });

  const accentBarWidth = interpolate(frame, [20, 50], [0, 320], { extrapolateRight: "clamp" });

  // exit fade
  const exitStart = durationInFrames - 12;
  const exitOpacity = interpolate(frame, [exitStart, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: colors.ink,
        opacity: exitOpacity,
        fontFamily: typography.fontFamily,
        padding: 160,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {/* Eyebrow */}
      <div
        style={{
          color: colors.brandSub,
          fontSize: typography.micro,
          fontWeight: typography.medium,
          letterSpacing: typography.trackingMicro,
          opacity: eyebrowOpacity,
          transform: `translateX(${eyebrowX}px)`,
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div style={{ width: 32, height: 1, backgroundColor: colors.brandSub }} />
        {eyebrow}
      </div>

      {/* Massive headline number */}
      <div
        style={{
          color: colors.verified,
          fontSize: 240,
          fontWeight: typography.thin,
          letterSpacing: "-0.04em",
          lineHeight: 0.95,
          opacity: headlineOpacity,
          transform: `translateY(${headlineY}px) scale(${headlineScale})`,
          transformOrigin: "left center",
          marginBottom: 16,
        }}
      >
        {headline}
      </div>

      {/* Headline label + accent bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          opacity: headlineLabelOpacity,
          marginBottom: 80,
        }}
      >
        <div style={{ height: 2, width: accentBarWidth, backgroundColor: colors.verified }} />
        <div
          style={{
            color: colors.textSecondary,
            fontSize: typography.body,
            fontWeight: typography.regular,
            letterSpacing: typography.trackingMicro,
          }}
        >
          {headlineLabel}
        </div>
      </div>

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
          gap: 80,
          borderTop: `1px solid ${colors.border}`,
          paddingTop: 48,
        }}
      >
        {stats.map((stat, i) => {
          const statStart = 36 + i * 8;
          const statOpacity = interpolate(frame, [statStart, statStart + 24], [0, 1], {
            extrapolateRight: "clamp",
          });
          const statY = interpolate(frame, [statStart, statStart + 28], [16, 0], {
            extrapolateRight: "clamp",
          });

          return (
            <div
              key={i}
              style={{
                opacity: statOpacity,
                transform: `translateY(${statY}px)`,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  color: accentColor(stat.accent),
                  fontSize: typography.h1,
                  fontWeight: typography.thin,
                  letterSpacing: typography.trackingTight,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  color: colors.textMuted,
                  fontSize: typography.micro,
                  fontWeight: typography.medium,
                  letterSpacing: typography.trackingMicro,
                }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Optional bottom caption */}
      {caption && (
        <div
          style={{
            position: "absolute",
            bottom: 100,
            right: 160,
            color: colors.textMuted,
            fontSize: typography.micro,
            letterSpacing: typography.trackingMicro,
            opacity: interpolate(frame, [60, 90], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          {caption}
        </div>
      )}
    </div>
  );
};
