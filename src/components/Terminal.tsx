import { interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

export interface TerminalLine {
  /** $ for prompt, > for indented output, "" for plain output, "✓" for success */
  marker?: "$" | ">" | "" | "✓" | "✗" | "→";
  /** main content; can include @colored:[text] tokens for highlighting */
  content: string;
  /** optional dim trailing comment */
  comment?: string;
  /** semantic color override for the marker */
  variant?: "default" | "verified" | "warning" | "reject" | "muted";
  /** delay before this line types in (frames after start of terminal) */
  startFrame: number;
  /** how many frames to take to type (default: content.length * 1) */
  typeDuration?: number;
}

interface TerminalProps {
  lines: TerminalLine[];
  title?: string;       // window chrome label, e.g. "~/code/quaestor-core"
}

const markerColor = (variant: TerminalLine["variant"], marker: TerminalLine["marker"]) => {
  if (variant === "verified") return colors.verified;
  if (variant === "warning") return colors.warning;
  if (variant === "reject") return colors.reject;
  if (variant === "muted") return colors.textMuted;
  if (marker === "$") return colors.verified;
  if (marker === "→") return colors.warning;
  if (marker === "✓") return colors.verified;
  if (marker === "✗") return colors.reject;
  return colors.textSecondary;
};

const renderContent = (raw: string, color: string) => {
  // Parse @verified:[text], @warning:[text], @code:[text] tokens
  const parts: { text: string; color: string }[] = [];
  const re = /@(verified|warning|reject|code|muted):\[([^\]]+)\]/g;
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(raw)) !== null) {
    if (m.index > last) parts.push({ text: raw.slice(last, m.index), color });
    const tokenColor =
      m[1] === "verified" ? colors.verified :
      m[1] === "warning" ? colors.warning :
      m[1] === "reject" ? colors.reject :
      m[1] === "code" ? colors.brand :
      colors.textMuted;
    parts.push({ text: m[2] ?? "", color: tokenColor });
    last = m.index + m[0].length;
  }
  if (last < raw.length) parts.push({ text: raw.slice(last), color });

  return parts;
};

export const Terminal: React.FC<TerminalProps> = ({ lines, title = "~/code/quaestor-core" }) => {
  const frame = useCurrentFrame();

  // Window fade in
  const windowOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const windowY = interpolate(frame, [0, 24], [12, 0], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        top: 100,
        left: 100,
        right: 100,
        bottom: 240,
        opacity: windowOpacity,
        transform: `translateY(${windowY}px)`,
        backgroundColor: colors.shadow,
        border: `1px solid ${colors.border}`,
        fontFamily: typography.fontFamily,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Window chrome */}
      <div
        style={{
          height: 48,
          backgroundColor: colors.panel,
          borderBottom: `1px solid ${colors.border}`,
          display: "flex",
          alignItems: "center",
          paddingLeft: 24,
          paddingRight: 24,
          gap: 16,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: colors.borderStrong }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: colors.borderStrong }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: colors.borderStrong }} />
        </div>
        <div
          style={{
            color: colors.textMuted,
            fontSize: typography.micro,
            letterSpacing: typography.trackingMicro,
            marginLeft: 16,
          }}
        >
          {title}
        </div>
        <div style={{ flex: 1 }} />
        <div
          style={{
            color: colors.textDim,
            fontSize: typography.micro,
            letterSpacing: typography.trackingMicro,
          }}
        >
          NODE 22 / PNPM
        </div>
      </div>

      {/* Terminal body */}
      <div
        style={{
          flex: 1,
          padding: 36,
          paddingTop: 28,
          fontSize: typography.code,
          lineHeight: 1.7,
          color: colors.textPrimary,
          overflow: "hidden",
        }}
      >
        {lines.map((line, i) => {
          const typeDuration = line.typeDuration ?? Math.max(8, line.content.length);
          const localFrame = frame - line.startFrame;

          // Don't render until we're near the start
          if (localFrame < -2) return null;

          // Reveal characters progressively
          const charsToShow = Math.max(
            0,
            Math.min(line.content.length, Math.floor((localFrame / typeDuration) * line.content.length))
          );
          const visible = line.content.slice(0, charsToShow);
          const lineOpacity = interpolate(localFrame, [-2, 4], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

          // Cursor blink (only on the line currently typing)
          const isTyping = charsToShow < line.content.length && localFrame >= 0;
          const cursorVisible = isTyping && Math.floor(frame / 8) % 2 === 0;

          // Show comment only after typing completes
          const commentOpacity = interpolate(
            localFrame,
            [typeDuration, typeDuration + 8],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );

          const mc = markerColor(line.variant, line.marker);
          const baseColor = line.variant === "muted" ? colors.textMuted : colors.textPrimary;

          return (
            <div
              key={i}
              style={{
                opacity: lineOpacity,
                display: "flex",
                gap: 16,
                whiteSpace: "pre",
                marginBottom: 4,
              }}
            >
              {line.marker !== undefined && (
                <span style={{ color: mc, width: 24, flexShrink: 0 }}>
                  {line.marker || " "}
                </span>
              )}
              <span style={{ color: baseColor, flex: 1 }}>
                {renderContent(visible, baseColor).map((part, pi) => (
                  <span key={pi} style={{ color: part.color }}>{part.text}</span>
                ))}
                {cursorVisible && (
                  <span style={{ color: colors.verified, marginLeft: 2 }}>▍</span>
                )}
                {line.comment && (
                  <span
                    style={{
                      color: colors.textMuted,
                      marginLeft: 24,
                      opacity: commentOpacity,
                    }}
                  >
                    {line.comment}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
