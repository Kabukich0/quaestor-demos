import { interpolate, useCurrentFrame } from "remotion";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";

interface BasescanFrameProps {
  txHash: string;
  from: string;
  to: string;
  amount: string;       // human-readable, e.g. "0.001 USDC"
  status?: "pending" | "success";
  network?: string;     // "Base Sepolia"
  blockNumber?: string;
  timestamp?: string;
}

const Field: React.FC<{ label: string; value: string; mono?: boolean; accent?: string }> = ({
  label,
  value,
  mono = true,
  accent,
}) => (
  <div style={{ display: "flex", gap: 32, alignItems: "baseline", marginBottom: 18 }}>
    <div
      style={{
        color: colors.textMuted,
        fontSize: typography.micro,
        letterSpacing: typography.trackingMicro,
        width: 240,
        flexShrink: 0,
      }}
    >
      {label}
    </div>
    <div
      style={{
        color: accent ?? colors.textPrimary,
        fontSize: typography.code,
        fontFamily: mono ? typography.fontFamily : "inherit",
      }}
    >
      {value}
    </div>
  </div>
);

export const BasescanFrame: React.FC<BasescanFrameProps> = ({
  txHash,
  from,
  to,
  amount,
  status = "success",
  network = "Base Sepolia",
  blockNumber = "21,847,392",
  timestamp = "Apr-29-2026 14:23:18 UTC",
}) => {
  const frame = useCurrentFrame();

  const fadeIn = interpolate(frame, [0, 24], [0, 1], { extrapolateRight: "clamp" });
  const slideIn = interpolate(frame, [0, 30], [40, 0], { extrapolateRight: "clamp" });

  // Pending → success transition at frame 60
  const showSuccess = status === "success" || frame > 60;
  const successOpacity = interpolate(frame, [56, 70], [0, 1], { extrapolateRight: "clamp" });
  const pendingOpacity = interpolate(frame, [56, 64], [1, 0], { extrapolateRight: "clamp" });

  return (
    <div
      style={{
        position: "absolute",
        top: 80,
        left: 100,
        right: 100,
        bottom: 220,
        opacity: fadeIn,
        transform: `translateY(${slideIn}px)`,
        backgroundColor: colors.shadow,
        border: `1px solid ${colors.border}`,
        fontFamily: typography.fontFamily,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Browser chrome */}
      <div
        style={{
          height: 64,
          backgroundColor: colors.panel,
          borderBottom: `1px solid ${colors.border}`,
          display: "flex",
          alignItems: "center",
          paddingLeft: 24,
          paddingRight: 24,
          gap: 24,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: colors.borderStrong }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: colors.borderStrong }} />
          <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: colors.borderStrong }} />
        </div>
        <div
          style={{
            flex: 1,
            backgroundColor: colors.ink,
            border: `1px solid ${colors.border}`,
            padding: "8px 16px",
            color: colors.textSecondary,
            fontSize: typography.micro,
            letterSpacing: typography.trackingNormal,
          }}
        >
          sepolia.basescan.org/tx/{txHash.slice(0, 12)}…{txHash.slice(-8)}
        </div>
      </div>

      {/* Page header */}
      <div
        style={{
          padding: "32px 48px 24px",
          borderBottom: `1px solid ${colors.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              color: colors.textMuted,
              fontSize: typography.micro,
              letterSpacing: typography.trackingMicro,
              marginBottom: 8,
            }}
          >
            TRANSACTION DETAILS
          </div>
          <div style={{ color: colors.textPrimary, fontSize: typography.h2, fontWeight: typography.thin }}>
            {network}
          </div>
        </div>

        {/* Status pill */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: pendingOpacity,
              display: status === "pending" || frame <= 60 ? "flex" : "none",
              alignItems: "center",
              gap: 12,
              padding: "10px 20px",
              border: `1px solid ${colors.warning}`,
              color: colors.warning,
              fontSize: typography.micro,
              letterSpacing: typography.trackingMicro,
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: colors.warning,
                opacity: Math.abs(Math.sin(frame / 6)),
              }}
            />
            PENDING
          </div>
          {showSuccess && (
            <div
              style={{
                opacity: successOpacity,
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 20px",
                border: `1px solid ${colors.verified}`,
                color: colors.verified,
                fontSize: typography.micro,
                letterSpacing: typography.trackingMicro,
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: colors.verified }} />
              CONFIRMED
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: "36px 48px", display: "flex", flexDirection: "column" }}>
        <Field label="Transaction Hash" value={txHash} accent={colors.brand} />
        <Field
          label="Status"
          value={showSuccess ? "Success — included in block" : "Pending — awaiting inclusion"}
          mono={false}
          accent={showSuccess ? colors.verified : colors.warning}
        />
        <Field label="Block" value={blockNumber} />
        <Field label="Timestamp" value={timestamp} mono={false} />
        <div style={{ height: 24 }} />
        <Field label="From" value={from} />
        <Field label="To" value={to} />
        <Field label="Value" value={amount} accent={colors.verified} />
      </div>
    </div>
  );
};
