import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { fonts, palette } from "../MainVideo";

const STATS = [
  { value: "30%", label: "del cibo cucinato\nogni giorno sprecato", delay: 16 },
  { value: "5M", label: "persone in povertà\nalimentare in Italia", delay: 56 },
  { value: "0€", label: "costo per chi\nriceve il cibo", delay: 96 },
];

export const SceneImpatto: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = interpolate(frame, [4, 22], [0, 1], { extrapolateRight: "clamp" });
  const closing = interpolate(frame, [160, 190], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ padding: 80, justifyContent: "center" }}>
      <div style={{
        fontFamily: fonts.body, fontSize: 18, letterSpacing: 5,
        textTransform: "uppercase", color: palette.terracotta,
        fontWeight: 700, opacity: headerOpacity,
      }}>
        L'impatto
      </div>
      <div style={{
        fontFamily: fonts.display, fontSize: 78, lineHeight: 1, marginTop: 14,
        color: palette.ink, fontStyle: "italic",
        opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" }),
        transform: `translateY(${interpolate(frame, [10, 30], [20, 0], { extrapolateRight: "clamp" })}px)`,
      }}>
        I numeri che<br/>vogliamo cambiare.
      </div>

      <div style={{
        display: "flex", gap: 40, marginTop: 70, flexWrap: "wrap",
      }}>
        {STATS.map((s, i) => {
          const sp = spring({ frame: frame - s.delay, fps, config: { damping: 18 } });
          const labelOpacity = interpolate(frame, [s.delay + 14, s.delay + 30], [0, 1], { extrapolateRight: "clamp" });
          return (
            <div key={i} style={{
              flex: 1, minWidth: 280,
              opacity: sp,
              transform: `translateY(${interpolate(sp, [0, 1], [30, 0])}px)`,
            }}>
              <div style={{
                fontFamily: fonts.display, fontSize: 140, lineHeight: 0.9,
                color: palette.terracotta, fontStyle: "italic",
              }}>
                {s.value}
              </div>
              <div style={{
                marginTop: 12, fontSize: 22, color: palette.inkSoft,
                whiteSpace: "pre-line", opacity: labelOpacity,
              }}>
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        marginTop: 60, fontFamily: fonts.display, fontStyle: "italic",
        fontSize: 36, color: palette.sage, opacity: closing,
        transform: `translateY(${interpolate(closing, [0, 1], [16, 0])}px)`,
      }}>
        Insieme possiamo cambiarli.
      </div>
    </AbsoluteFill>
  );
};
