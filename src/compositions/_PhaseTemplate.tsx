// Copy this file to Phase{N}.tsx and customize.
// Then register it in src/Root.tsx and add a render:{N} script to package.json.

import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { TitleCard } from "../components/TitleCard";
import { Caption } from "../components/Caption";
import { Terminal, type TerminalLine } from "../components/Terminal";
import { Outro } from "../components/Outro";
import { colors } from "../theme/colors";

const lines: TerminalLine[] = [
  { marker: "$", content: "your demo command here", startFrame: 10 },
  { marker: "✓", content: "result line", startFrame: 90, variant: "verified" },
];

export const PhaseTemplate: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.ink }}>
      <Sequence from={0} durationInFrames={120}>
        <TitleCard
          eyebrow="QUAESTOR / PHASE X.Y"
          title="One sentence that captures the milestone."
          subtitle="BASE SEPOLIA — MONTH YEAR"
        />
      </Sequence>

      <Sequence from={120} durationInFrames={300}>
        <Terminal lines={lines} title="context-here" />
        <Caption
          label="STEP 01 / VERB"
          text="Caption explaining what's happening."
          variant="default"
        />
      </Sequence>

      <Sequence from={420} durationInFrames={120}>
        <Outro
          claim="The killer line."
          subClaim="The supporting line."
          cta="github.com/Kabukich0/quaestor-core"
        />
      </Sequence>
    </AbsoluteFill>
  );
};
