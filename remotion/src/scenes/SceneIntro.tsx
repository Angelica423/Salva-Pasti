import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { fonts, palette } from "../MainVideo";

export const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleY = spring({ frame: frame - 6, fps, config: { damping: 18, stiffness: 120 } });
  const titleOpacity = interpolate(frame, [6, 24], [0, 1], { extrapolateRight: "clamp" });
  const subY = spring({ frame: frame - 30, fps, config: { damping: 20 } });
  const subOpacity = interpolate(frame, [30, 48], [0, 1], { extrapolateRight: "clamp" });
  const tagOpacity = interpolate(frame, [55, 75], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ padding: 100, justifyContent: "center" }}>
      {/* Floating soft shapes */}
      <div style={{
        position: "absolute", top: 80, right: 120, width: 220, height: 220,
        borderRadius: "50%", background: palette.terracotta, opacity: 0.12,
        transform: `translateY(${Math.sin(frame / 20) * 12}px)`,
      }} />
      <div style={{
        position: "absolute", bottom: 100, left: 90, width: 160, height: 160,
        borderRadius: "50%", background: palette.sage, opacity: 0.14,
        transform: `translateY(${Math.cos(frame / 24) * 10}px)`,
      }} />

      <div style={{
        fontFamily: fonts.body, fontSize: 22, letterSpacing: 6,
        textTransform: "uppercase", color: palette.terracotta,
        opacity: tagOpacity, fontWeight: 600,
      }}>
        Salva Pasti
      </div>
      <div style={{
        fontFamily: fonts.display, fontSize: 160, lineHeight: 0.95,
        marginTop: 24, color: palette.ink, fontStyle: "italic",
        transform: `translateY(${interpolate(titleY, [0, 1], [40, 0])}px)`,
        opacity: titleOpacity,
      }}>
        Come<br />funziona
      </div>
      <div style={{
        marginTop: 36, fontSize: 30, color: palette.inkSoft, maxWidth: 720,
        transform: `translateY(${interpolate(subY, [0, 1], [20, 0])}px)`,
        opacity: subOpacity, fontWeight: 500,
      }}>
        Da cibo in eccesso a famiglie che mangiano — in quattro passaggi.
      </div>
    </AbsoluteFill>
  );
};
