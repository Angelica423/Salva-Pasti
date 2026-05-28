import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { loadFont as loadDisplay } from "@remotion/google-fonts/InstrumentSerif";
import { loadFont as loadBody } from "@remotion/google-fonts/Inter";

import { SceneIntro } from "./scenes/SceneIntro";
import { SceneRistorante } from "./scenes/SceneRistorante";
import { SceneMappa } from "./scenes/SceneMappa";
import { ScenePrenota } from "./scenes/ScenePrenota";
import { SceneRitiro } from "./scenes/SceneRitiro";
import { SceneProssimita } from "./scenes/SceneProssimita";
import { SceneImpatto } from "./scenes/SceneImpatto";
import { SceneOutro } from "./scenes/SceneOutro";

const { fontFamily: display } = loadDisplay("normal", { weights: ["400"], subsets: ["latin"] });
const { fontFamily: body } = loadBody("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

export const fonts = { display, body };

// Warm editorial palette — cream, charcoal, terracotta, sage
export const palette = {
  bg: "#f5f0e6",
  ink: "#1f1d1a",
  inkSoft: "#5a564d",
  terracotta: "#c25a3a",
  sage: "#6b8a5e",
  gold: "#d4a14a",
};

// Timing budget @30fps = 60s = 1800 frames.
// Sequences sum = 1940, transitions (7 × 20) overlap = 140 → 1800 total.
const T = 20;

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: palette.bg, fontFamily: fonts.body, color: palette.ink }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={200}>
          <SceneIntro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={240}>
          <SceneRistorante />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={260}>
          <SceneMappa />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={240}>
          <ScenePrenota />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={240}>
          <SceneRitiro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={260}>
          <SceneProssimita />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={240}>
          <SceneImpatto />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: T })} />

        <TransitionSeries.Sequence durationInFrames={260}>
          <SceneOutro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
