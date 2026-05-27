import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { fonts, palette } from "../MainVideo";

export const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const t1 = spring({ frame: frame - 4, fps, config: { damping: 18 } });
  const t2 = spring({ frame: frame - 28, fps, config: { damping: 20 } });
  const t3 = spring({ frame: frame - 52, fps, config: { damping: 20 } });

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 80, textAlign: "center" }}>
      {/* Soft glow */}
      <div style={{
        position: "absolute", width: 700, height: 700, borderRadius: "50%",
        background: `radial-gradient(circle, ${palette.gold}33 0%, transparent 70%)`,
        opacity: interpolate(frame, [0, 30], [0, 1], { extrapolateRight: "clamp" }),
      }} />

      <div style={{
        fontSize: 22, letterSpacing: 6, textTransform: "uppercase",
        color: palette.terracotta, fontWeight: 600,
        opacity: t1, transform: `translateY(${interpolate(t1, [0, 1], [16, 0])}px)`,
      }}>
        Salva Pasti
      </div>
      <div style={{
        fontFamily: fonts.display, fontSize: 140, lineHeight: 1, marginTop: 18,
        color: palette.ink, fontStyle: "italic",
        opacity: t2, transform: `translateY(${interpolate(t2, [0, 1], [24, 0])}px)`,
      }}>
        Nessun pasto<br/>sprecato.
      </div>
      <div style={{
        marginTop: 32, fontSize: 28, color: palette.inkSoft, maxWidth: 760,
        opacity: t3, transform: `translateY(${interpolate(t3, [0, 1], [16, 0])}px)`,
      }}>
        Unisciti a ristoranti, associazioni e volontari che ogni sera salvano cibo
        per chi ne ha bisogno.
      </div>
    </AbsoluteFill>
  );
};
