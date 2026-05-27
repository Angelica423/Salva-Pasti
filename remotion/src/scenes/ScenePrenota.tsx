import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { fonts, palette } from "../MainVideo";

export const ScenePrenota: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const cardOpacity = interpolate(frame, [6, 22], [0, 1], { extrapolateRight: "clamp" });
  const cardY = interpolate(frame, [6, 22], [30, 0], { extrapolateRight: "clamp" });

  // Tap animation around frame 45
  const tap = spring({ frame: frame - 45, fps, config: { damping: 8, stiffness: 200 } });
  const tapRing = interpolate(frame, [45, 65], [0, 1], { extrapolateRight: "clamp" });

  // Code reveal at frame 75
  const codeSpring = spring({ frame: frame - 78, fps, config: { damping: 14 } });
  const flipped = frame > 72;

  return (
    <AbsoluteFill style={{ padding: 80, alignItems: "center", justifyContent: "center" }}>
      <div style={{
        fontFamily: fonts.display, fontSize: 84, color: palette.ink, fontStyle: "italic",
        opacity: interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" }),
        marginBottom: 40,
      }}>
        <span style={{ color: palette.terracotta }}>03</span> &nbsp;Un tap. Prenotata.
      </div>

      <div style={{ position: "relative", perspective: 1200 }}>
        <div style={{
          width: 460, height: 320, borderRadius: 28,
          background: "white", boxShadow: "0 40px 100px rgba(31,29,26,0.22)",
          opacity: cardOpacity, transform: `translateY(${cardY}px) rotateY(${flipped ? 180 : 0}deg)`,
          transition: "none", transformStyle: "preserve-3d",
          border: `1px solid ${palette.ink}10`,
        }}>
          {!flipped ? (
            <div style={{ padding: 36 }}>
              <div style={{ fontSize: 14, letterSpacing: 3, textTransform: "uppercase", color: palette.sage, fontWeight: 700 }}>
                Disponibile
              </div>
              <div style={{ fontFamily: fonts.display, fontSize: 44, marginTop: 8, color: palette.ink, fontStyle: "italic" }}>
                Trattoria Da Lucia
              </div>
              <div style={{ marginTop: 14, color: palette.inkSoft, fontSize: 20 }}>
                8 porzioni · Via Roma 12
              </div>
              <div style={{ marginTop: 14, color: palette.inkSoft, fontSize: 18 }}>
                Ritiro 19:00 – 20:00
              </div>
              <button style={{
                marginTop: 32, padding: "16px 28px", borderRadius: 999,
                background: palette.ink, color: palette.bg, border: "none",
                fontSize: 20, fontWeight: 600, fontFamily: fonts.body,
              }}>
                Prenota questa box
              </button>
            </div>
          ) : (
            <div style={{
              padding: 36, height: "100%", transform: "rotateY(180deg)",
              display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: "50%", background: palette.sage,
                color: "white", fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center",
                transform: `scale(${codeSpring})`,
              }}>✓</div>
              <div style={{ fontFamily: fonts.display, fontSize: 36, marginTop: 18, color: palette.ink, fontStyle: "italic" }}>
                Prenotazione confermata
              </div>
              <div style={{ marginTop: 14, fontSize: 16, color: palette.inkSoft, letterSpacing: 1 }}>
                Codice di ritiro
              </div>
              <div style={{
                marginTop: 8, fontSize: 44, fontFamily: "monospace", letterSpacing: 8,
                color: palette.terracotta, fontWeight: 700,
              }}>
                7K4M9X
              </div>
            </div>
          )}
        </div>

        {/* Tap ring */}
        {frame >= 45 && frame <= 70 && (
          <div style={{
            position: "absolute", left: "50%", bottom: 60,
            transform: `translate(-50%, 50%) scale(${tap})`,
            width: 80, height: 80, borderRadius: "50%",
            border: `3px solid ${palette.terracotta}`,
            opacity: 1 - tapRing,
          }} />
        )}
        {/* Finger dot */}
        {frame >= 38 && frame <= 60 && (
          <div style={{
            position: "absolute", left: "50%", bottom: 60,
            transform: "translate(-50%, 50%)",
            width: 28, height: 28, borderRadius: "50%",
            background: palette.ink, opacity: 0.7,
          }} />
        )}
      </div>
    </AbsoluteFill>
  );
};
