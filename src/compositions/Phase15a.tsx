import { AbsoluteFill, Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { TitleCard } from "../components/TitleCard";
import { Caption } from "../components/Caption";
import { Terminal, type TerminalLine } from "../components/Terminal";
import { BasescanFrame } from "../components/BasescanFrame";
import { Outro } from "../components/Outro";
import { colors } from "../theme/colors";

// Real data from the Phase 1.5a settlement.
const TX_HASH = "0xbaeb93856c4a660e06d0733b53f67c60d1fa59667fd5810e0c82cbf86ba8ac56";
const SETTLEMENT_FROM = "0xf3F00F230aD037cA3b730b5E229495c085578c17";
const DEMO_SELLER_TO = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const AMOUNT = "0.001 USDC";

// Timeline (30fps):
// 0:00 - 0:05  Title card                    (0–150f)
// 0:05 - 0:18  Terminal: agent issues mandate redemption  (150–540f)
// 0:18 - 0:33  Terminal: core verifies + signs            (540–990f)
// 0:33 - 0:48  Terminal: bridge submits to facilitator    (990–1440f)
// 0:48 - 1:18  Basescan frame: pending → confirmed        (1440–2340f)
// 1:18 - 1:30  Outro                                       (2340–2700f)

const issuanceLines: TerminalLine[] = [
  { marker: "$", content: "curl -X POST $CORE/mandate/redeem \\", startFrame: 10 },
  { marker: ">", content: '  -H "Content-Type: application/json" \\', startFrame: 40, variant: "muted" },
  { marker: ">", content: "  -d '{ jti: @code:[a47e75e0…2dc9c], amount: 0.001 }'", startFrame: 70, variant: "muted" },
  { marker: "", content: "", startFrame: 110 },
  { marker: "→", content: "agent submits redemption envelope", startFrame: 130, variant: "warning" },
  { marker: "", content: "", startFrame: 200 },
  { marker: "✓", content: "mandate verified — @verified:[2 uses remaining]", startFrame: 220, variant: "verified", comment: "// jwt sig ok" },
  { marker: "✓", content: "spend cap check — @verified:[$0.001 ≤ $0.10]", startFrame: 270, variant: "verified" },
  { marker: "✓", content: "intent allowlist — @verified:[ok]", startFrame: 320, variant: "verified" },
];

const signingLines: TerminalLine[] = [
  { marker: "", content: "[core] /mandate/sign-x402 received", startFrame: 10, variant: "muted" },
  { marker: "→", content: "deriving settlement key — m/44'/60'/0'/0/1", startFrame: 50, variant: "warning" },
  { marker: "→", content: "address = @code:[" + SETTLEMENT_FROM + "]", startFrame: 110, variant: "warning" },
  { marker: "", content: "", startFrame: 170 },
  { marker: "→", content: "verifying USDC DOMAIN_SEPARATOR on-chain…", startFrame: 190, variant: "warning" },
  { marker: "✓", content: "match — name=USDC, version=2, chainId=84532", startFrame: 280, variant: "verified" },
  { marker: "", content: "", startFrame: 330 },
  { marker: "→", content: "signing EIP-3009 TransferWithAuthorization…", startFrame: 350, variant: "warning" },
  { marker: "✓", content: "@verified:[signature emitted] — counter decremented atomically", startFrame: 410, variant: "verified" },
];

const facilitatorLines: TerminalLine[] = [
  { marker: "", content: "[bridge] payOnChain() — keys held: 0", startFrame: 10, variant: "muted" },
  { marker: "→", content: "POST x402.org/facilitator/settle", startFrame: 50, variant: "warning" },
  { marker: ">", content: "  X-PAYMENT: <signed envelope>", startFrame: 110, variant: "muted" },
  { marker: "", content: "", startFrame: 170 },
  { marker: "→", content: "facilitator submits to base sepolia…", startFrame: 200, variant: "warning" },
  { marker: "", content: "  awaiting inclusion…", startFrame: 270, variant: "muted" },
  { marker: "✓", content: "tx_hash = @code:[" + TX_HASH.slice(0, 16) + "…]", startFrame: 340, variant: "verified" },
  { marker: "✓", content: "@verified:[ledger receipt written] — seq 121", startFrame: 400, variant: "verified" },
];

export const Phase15a: React.FC<{ narrationSrc?: string }> = ({ narrationSrc }) => {
  const { durationInFrames } = useVideoConfig();

  // Audio is optional — Remotion will simply not include it if the file is missing.
  // (User runs `pnpm narrate:1.5a` to generate it.)

  return (
    <AbsoluteFill style={{ backgroundColor: colors.ink }}>
      {/* Background grid texture for subtle depth — pure CSS, no images */}
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
          eyebrow="QUAESTOR / PHASE 1.5A"
          title="The first mandate, signed and settled."
          subtitle="BASE SEPOLIA — APR 2026"
        />
      </Sequence>

      {/* 0:05 – 0:18 — Agent redemption */}
      <Sequence from={150} durationInFrames={390}>
        <Terminal lines={issuanceLines} title="agent ~/code" />
        <Caption
          label="STEP 01 / REDEEM"
          text="An AI agent presents a mandate JWT. Core verifies — never the bridge."
          variant="default"
        />
      </Sequence>

      {/* 0:18 – 0:33 — Core signs */}
      <Sequence from={540} durationInFrames={450}>
        <Terminal lines={signingLines} title="quaestor-core / daemon" />
        <Caption
          label="STEP 02 / SIGN"
          text="Core derives a per-mandate key from its HD vault and signs in-process."
          variant="verified"
        />
      </Sequence>

      {/* 0:33 – 0:48 — Bridge to facilitator */}
      <Sequence from={990} durationInFrames={450}>
        <Terminal lines={facilitatorLines} title="quaestor-bridge / x402 adapter" />
        <Caption
          label="STEP 03 / RELAY"
          text="Bridge wraps the signature and forwards. Holds zero keys throughout."
          variant="default"
        />
      </Sequence>

      {/* 0:48 – 1:18 — Basescan */}
      <Sequence from={1440} durationInFrames={900}>
        <BasescanFrame
          txHash={TX_HASH}
          from={SETTLEMENT_FROM}
          to={DEMO_SELLER_TO}
          amount={AMOUNT}
          status="pending"
        />
        <Caption
          label="STEP 04 / SETTLE"
          text="Real on-chain transfer. Verifiable by anyone. No third party held a key."
          variant="verified"
          position="bottom"
        />
      </Sequence>

      {/* 1:18 – 1:30 — Outro */}
      <Sequence from={2340} durationInFrames={360}>
        <Outro
          claim="Bridge held zero keys."
          subClaim="The only mandate engine that means it."
          cta="github.com/Kabukich0/quaestor-core"
        />
      </Sequence>

      {/* Narration audio — only rendered when render.ts detects the WAV exists */}
      {narrationSrc && <Audio src={staticFile(narrationSrc)} />}
    </AbsoluteFill>
  );
};
