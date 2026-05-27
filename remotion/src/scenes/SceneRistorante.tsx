import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { fonts, palette } from "../MainVideo";

export const SceneRistorante: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numberSpring = spring({ frame: frame - 8, fps, config: { damping: 14 } });
  const cardSpring = spring({ frame: frame - 24, fps, config: { damping: 18 } });
  const tag1 = spring({ frame: frame - 50, fps, config: { damping: 16 } });
  const tag2 = spring({ frame: frame - 62, fps, config: { damping: 16 } });
  const tag3 = spring({ frame: frame - 74, fps, config: { damping: 16 } });

  return (
    <AbsoluteFill style={{ padding: 80, flexDirection: "row", alignItems: "center", gap: 60 }}>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: fonts.display, fontSize: 200, lineHeight: 0.9,
          color: palette.terracotta, fontStyle: "italic",
          transform: `scale(${interpolate(numberSpring, [0, 1], [0.6, 1])})`,
          transformOrigin: "left center",
          opacity: interpolate(frame, [8, 22], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          01
        </div>
        <div style={{
          fontFamily: fonts.display, fontSize: 78, lineHeight: 1, marginTop: 12,
          color: palette.ink, fontStyle: "italic",
          opacity: interpolate(frame, [24, 40], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(frame, [24, 40], [16, 0], { extrapolateRight: "clamp" })}px)`,
        }}>
          Il locale<br />pubblica una box
        </div>
        <div style={{
          marginTop: 24, fontSize: 24, color: palette.inkSoft, maxWidth: 460,
          opacity: interpolate(frame, [40, 56], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          Ristoranti, panetterie, gelaterie. In 30 secondi il cibo invenduto
          diventa una box da salvare.
        </div>
      </div>

      {/* Mock box card */}
      <div style={{
        width: 420, padding: 32, borderRadius: 24,
        background: "white", boxShadow: "0 30px 80px rgba(31,29,26,0.18)",
        transform: `translateY(${interpolate(cardSpring, [0, 1], [60, 0])}px) rotate(${interpolate(cardSpring, [0, 1], [4, -2])}deg)`,
        opacity: interpolate(frame, [24, 42], [0, 1], { extrapolateRight: "clamp" }),
        border: `1px solid ${palette.ink}10`,
      }}>
        <div style={{ fontSize: 14, letterSpacing: 3, textTransform: "uppercase", color: palette.sage, fontWeight: 700 }}>
          Disponibile
        </div>
        <div style={{ fontFamily: fonts.display, fontSize: 44, marginTop: 8, color: palette.ink, fontStyle: "italic" }}>
          Trattoria<br/>Da Lucia
        </div>
        <div style={{ marginTop: 16, color: palette.inkSoft, fontSize: 20 }}>
          8 porzioni · pasta + verdure
        </div>
        <div style={{ marginTop: 24, display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { label: "vegetariano", spring: tag1 },
            { label: "senza glutine", spring: tag2 },
            { label: "ritiro 19–20", spring: tag3 },
          ].map((t) => (
            <div key={t.label} style={{
              padding: "8px 16px", borderRadius: 999,
              background: palette.bg, fontSize: 16, color: palette.ink,
              transform: `scale(${interpolate(t.spring, [0, 1], [0.4, 1])})`,
              opacity: t.spring,
            }}>{t.label}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
