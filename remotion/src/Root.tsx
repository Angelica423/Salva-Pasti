import { Composition } from "remotion";
import { MainVideo } from "./MainVideo";

export const RemotionRoot = () => (
  <Composition
    id="main"
    component={MainVideo}
    // 60s @ 30fps
    durationInFrames={1800}
    fps={30}
    width={1280}
    height={720}
  />
);
