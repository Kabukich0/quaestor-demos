import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { TitleCard } from "../components/TitleCard";
import { Caption } from "../components/Caption";
import { Terminal, type TerminalLine } from "../components/Terminal";
import { MetricsPanel } from "../components/MetricsPanel";
import { Outro } from "../components/Outro";
import { colors } from "../theme/colors";

// Real Phase 2.0 metrics — from the eval run committed to quaestor-policy.
// 60 hand-labeled cases, Qwen 2.5 3B Q4_K_M, run on M-series.
// kept for reference / README metric
const FALSE_APPROVE_RATE = "0%";
const FALSE_REJECT_RATE = "5.0%";
const ACCURACY = "91.7%";
const P95_LATENCY = "5.6s";
const TOTAL_CASES = "60";

// Timeline (30fps, 2400 total frames = 80 seconds):
// 0:00 - 0:05  Title                                  (0–150f)
// 0:05 - 0:15  Terminal: agent issues mandate w/ intent  (150–450f)
// 0:15 - 0:34  Terminal: local model evaluates           (450–1020f)
// 0:34 - 0:54  Metrics panel: eval results               (1020–1620f)
// 0:54 - 1:20  Outro                                     (1620–2400f)

const intentLines: TerminalLine[] = [
  { marker: "$", content: "curl -X POST $CORE/mandate/issue \\", startFrame: 10 },
  { marker: ">", content: '  -H "Content-Type: application/json" \\', startFrame: 50, variant: "muted" },
  { marker: ">", content: "  -d '{", startFrame: 90, variant: "muted" },
  { marker: ">", content: '    "intent": "@code:[SaaS infra spend only — never marketing]",', startFrame: 110, variant: "muted" },
  { marker: ">", content: '    "spend_cap": 100, "uses": 5,', startFrame: 160, variant: "muted" },
  { marker: ">", content: '    "enforcement_mode": "@code:[hybrid]"', startFrame: 200, variant: "muted" },
  { marker: ">", content: "  }'", startFrame: 230, variant: "muted" },
  { marker: "", content: "", startFrame: 260 },
  { marker: "✓", content: "mandate issued — jti=@code:[a47e75e0…]", startFrame: 270, variant: "verified" },
  { marker: "✓", content: "intent stored locally — @verified:[never in JWT]", startFrame: 290, variant: "verified" },
];

const evaluationLines: TerminalLine[] = [
  { marker: "", content: "[bridge] redemption received — render.com $12.00 USDC", startFrame: 10, variant: "muted" },
  { marker: "", content: "", startFrame: 60 },
  { marker: "→", content: "[core] /mandate/sign-x402 — checking intent gate", startFrame: 80, variant: "warning" },
  { marker: "→", content: "loading qwen-2.5-3b-q4km from disk… ready (8.3s)", startFrame: 130, variant: "warning" },
  { marker: "→", content: "evaluating redemption against intent…", startFrame: 200, variant: "warning" },
  { marker: "", content: "", startFrame: 250 },
  { marker: "", content: "  intent:    @code:[SaaS infra spend only — never marketing]", startFrame: 270, variant: "muted" },
  { marker: "", content: "  recipient: @code:[render.com]", startFrame: 300, variant: "muted" },
  { marker: "", content: "  amount:    @code:[$12.00 USDC]", startFrame: 320, variant: "muted" },
  { marker: "", content: "  resource:  @code:[render web service starter]", startFrame: 340, variant: "muted" },
  { marker: "", content: "", startFrame: 370 },
  { marker: "→", content: "[model] verdict:    @verified:[approve]", startFrame: 390, variant: "warning" },
  { marker: "→", content: "[model] confidence: @verified:[0.93]", startFrame: 420, variant: "warning" },
  { marker: "→", content: "[model] reasoning:  render.com is SaaS infrastructure;", startFrame: 450, variant: "warning" },
  { marker: ">", content: '             matches intent. no marketing concern.', startFrame: 480, variant: "muted" },
  { marker: "", content: "", startFrame: 510 },
  { marker: "✓", content: "@verified:[enforcement: approve] — confidence ≥ 0.85 threshold", startFrame: 530, variant: "verified" },
  { marker: "✓", content: "signing & writing ledger receipt — verdict @verified:[annotated, hashed]", startFrame: 560, variant: "verified" },
];

export const Phase20: React.FC<{ narrationSrc?: string }> = ({ narrationSrc }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ink }}>
      {/* Background grid texture, same as 1.5a — visual continuity */}
      <AbsoluteFill
        style={{
          backgroundImage: `
            linear-gradient(${colors.border} 1px, transparent 1px),
            linear-gradient(90deg, ${colors.border} 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          opacity: 0.25,
        }}
      />

      {/* 0:00 – 0:05 — Title */}
      <Sequence from={0} durationInFrames={150}>
        <TitleCard
          eyebrow="QUAESTOR / PHASE 2.0"
          title="Intent enforcement, locally."
          subtitle="ON-DEVICE LLM — APR 2026"
        />
      </Sequence>

      {/* 0:05 – 0:15 — Mandate issued with intent */}
      <Sequence from={150} durationInFrames={300}>
        <Terminal lines={intentLines} title="agent ~/code" />
        <Caption
          label="STEP 01 / DECLARE INTENT"
          text="The user writes intent in plain language. Stored on-device. Never in the JWT."
          variant="default"
        />
      </Sequence>

      {/* 0:15 – 0:34 — Local model evaluates */}
      <Sequence from={450} durationInFrames={570}>
        <Terminal lines={evaluationLines} title="quaestor-core / policy plugin" />
        <Caption
          label="STEP 02 / EVALUATE"
          text="A local 3B model reads the intent, weighs the redemption, returns a verdict. No network."
          variant="verified"
        />
      </Sequence>

      {/* 0:34 – 0:54 — Eval metrics */}
      <Sequence from={1020} durationInFrames={600}>
        <MetricsPanel
          eyebrow={`EVAL RESULTS / ${TOTAL_CASES} HAND-LABELED CASES`}
          headline="100%"
          headlineLabel="VIOLATIONS CAUGHT ON HARD REJECTIONS"
          stats={[
            { value: ACCURACY, label: "OVERALL ACCURACY", accent: "verified" },
            { value: FALSE_REJECT_RATE, label: "FALSE REJECT RATE", accent: "default" },
            { value: P95_LATENCY, label: "P95 LATENCY", accent: "default" },
            { value: "0", label: "BYTES SHIPPED OFF DEVICE", accent: "verified" },
          ]}
          caption="QWEN 2.5 3B Q4_K_M / LOCAL INFERENCE / NO TELEMETRY"
        />
      </Sequence>

      {/* 0:54 – 1:20 — Outro */}
      <Sequence from={1620} durationInFrames={780}>
        <Outro
          claim="The intent never leaves your machine."
          subClaim="Every other agent payments stack ships your data. Quaestor doesn't."
          cta="github.com/Kabukich0/quaestor-policy"
        />
      </Sequence>

      {/* Narration audio — auto-detected by render.ts */}
      {narrationSrc && <Audio src={staticFile(narrationSrc)} />}
    </AbsoluteFill>
  );
};
