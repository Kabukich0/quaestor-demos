import { Composition, registerRoot } from "remotion";
import { Phase15a } from "./compositions/Phase15a";
import { Phase20 } from "./compositions/Phase20";
import { PhaseTemplate } from "./compositions/_PhaseTemplate";

const FPS = 30;
const WIDTH = 1920;
const HEIGHT = 1080;

const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Phase15a"
        component={Phase15a}
        durationInFrames={2700}  // 90s @ 30fps
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ narrationSrc: undefined }}
        schema={undefined}
      />

      <Composition
        id="Phase20"
        component={Phase20}
        durationInFrames={2400}  // 80s @ 30fps
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
        defaultProps={{ narrationSrc: undefined }}
        schema={undefined}
      />

      {/* Template — register so it shows up in `pnpm studio`. Don't render. */}
      <Composition
        id="PhaseTemplate"
        component={PhaseTemplate}
        durationInFrames={540}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};

registerRoot(RemotionRoot);
