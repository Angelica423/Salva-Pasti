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

export const MainVideo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: palette.bg, fontFamily: fonts.body, color: palette.ink }}>
      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={110}>
          <SceneIntro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 18 })} />

        <TransitionSeries.Sequence durationInFrames={130}>
          <SceneRistorante />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 22 })} />

        <TransitionSeries.Sequence durationInFrames={140}>
          <SceneMappa />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 22 })} />

        <TransitionSeries.Sequence durationInFrames={130}>
          <ScenePrenota />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={slide({ direction: "from-right" })} timing={linearTiming({ durationInFrames: 22 })} />

        <TransitionSeries.Sequence durationInFrames={130}>
          <SceneRitiro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 22 })} />

        <TransitionSeries.Sequence durationInFrames={120}>
          <SceneOutro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
