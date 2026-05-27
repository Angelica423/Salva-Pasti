import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { fonts, palette } from "../MainVideo";

export const SceneRitiro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = interpolate(frame, [6, 24], [0, 1], { extrapolateRight: "clamp" });
  const bagSpring = spring({ frame: frame - 26, fps, config: { damping: 16 } });
  const arrowProgress = interpolate(frame, [50, 90], [0, 1], { extrapolateRight: "clamp" });
  const heartSpring = spring({ frame: frame - 90, fps, config: { damping: 8, stiffness: 180 } });

  return (
    <AbsoluteFill style={{ padding: 80, alignItems: "center", justifyContent: "center" }}>
      <div style={{
        fontFamily: fonts.display, fontSize: 84, color: palette.ink, fontStyle: "italic",
        opacity: headerOpacity, marginBottom: 60,
      }}>
        <span style={{ color: palette.terracotta }}>04</span> &nbsp;Ritiro &amp; consegna
      </div>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 80,
        width: "100%",
      }}>
        {/* Restaurant */}
        <div style={{
          textAlign: "center",
          opacity: interpolate(frame, [20, 36], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(bagSpring, [0, 1], [20, 0])}px)`,
        }}>
          <div style={{
            width: 140, height: 140, borderRadius: 30, background: palette.terracotta,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 76, boxShadow: "0 20px 50px rgba(194,90,58,0.35)",
          }}>🍝</div>
          <div style={{ marginTop: 18, fontSize: 22, color: palette.ink, fontWeight: 600 }}>
            Trattoria
          </div>
        </div>

        {/* Arrow */}
        <div style={{ position: "relative", width: 220, height: 6 }}>
          <div style={{
            position: "absolute", left: 0, top: 0, height: 6,
            width: `${arrowProgress * 100}%`,
            background: palette.ink, borderRadius: 3,
          }} />
          {arrowProgress > 0.95 && (
            <div style={{
              position: "absolute", right: -4, top: -10,
              width: 0, height: 0,
              borderLeft: `20px solid ${palette.ink}`,
              borderTop: "13px solid transparent",
              borderBottom: "13px solid transparent",
            }} />
          )}
          {/* Bag traveling */}
          <div style={{
            position: "absolute", left: `${arrowProgress * 100}%`, top: -42,
            transform: "translateX(-50%)",
            fontSize: 44,
            opacity: arrowProgress > 0.02 && arrowProgress < 0.98 ? 1 : 0,
          }}>
            🛍️
          </div>
        </div>

        {/* Family */}
        <div style={{
          textAlign: "center",
          opacity: interpolate(frame, [70, 86], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          <div style={{
            width: 140, height: 140, borderRadius: 30, background: palette.sage,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 76, boxShadow: "0 20px 50px rgba(107,138,94,0.35)",
            transform: `scale(${interpolate(heartSpring, [0, 1], [1, 1.1])})`,
          }}>👨‍👩‍👧</div>
          <div style={{ marginTop: 18, fontSize: 22, color: palette.ink, fontWeight: 600 }}>
            Famiglia
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 60, fontFamily: fonts.display, fontStyle: "italic",
        fontSize: 36, color: palette.inkSoft,
        opacity: interpolate(frame, [95, 115], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        Mostri il codice. Il cibo è salvo.
      </div>
    </AbsoluteFill>
  );
};
