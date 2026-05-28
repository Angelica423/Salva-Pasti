import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { fonts, palette } from "../MainVideo";

export const SceneProssimita: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = interpolate(frame, [4, 22], [0, 1], { extrapolateRight: "clamp" });
  const phoneSpring = spring({ frame: frame - 16, fps, config: { damping: 16 } });
  const notifSpring = spring({ frame: frame - 70, fps, config: { damping: 12, stiffness: 160 } });
  const radarPulse = (frame % 60) / 60;
  const subtitle = interpolate(frame, [120, 145], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ padding: 80, flexDirection: "row", alignItems: "center", gap: 60 }}>
      <div style={{ flex: 1 }}>
        <div style={{
          fontFamily: fonts.display, fontSize: 200, lineHeight: 0.9,
          color: palette.terracotta, fontStyle: "italic",
          opacity: headerOpacity,
        }}>
          05
        </div>
        <div style={{
          fontFamily: fonts.display, fontSize: 76, lineHeight: 1, marginTop: 12,
          color: palette.ink, fontStyle: "italic",
          opacity: interpolate(frame, [22, 40], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(frame, [22, 40], [16, 0], { extrapolateRight: "clamp" })}px)`,
        }}>
          A 500 metri<br/>da te.
        </div>
        <div style={{
          marginTop: 24, fontSize: 24, color: palette.inkSoft, maxWidth: 460,
          opacity: interpolate(frame, [44, 64], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          L'app ti avvisa quando una box è disponibile vicino a te.
          Non devi più cercarla — è lei che trova te.
        </div>
        <div style={{
          marginTop: 28, fontFamily: fonts.display, fontStyle: "italic",
          fontSize: 28, color: palette.sage, opacity: subtitle,
        }}>
          Meno cibo scaduto. Più pasti salvati.
        </div>
      </div>

      {/* Phone mock with notification */}
      <div style={{
        width: 340, height: 540, alignSelf: "center", position: "relative",
        transform: `translateY(${interpolate(phoneSpring, [0, 1], [40, 0])}px)`,
        opacity: interpolate(frame, [16, 36], [0, 1], { extrapolateRight: "clamp" }),
      }}>
        {/* Radar pulse rings behind */}
        {[0, 0.33, 0.66].map((offset) => {
          const p = (radarPulse + offset) % 1;
          return (
            <div key={offset} style={{
              position: "absolute", left: "50%", top: "50%",
              transform: `translate(-50%, -50%) scale(${0.6 + p * 1.4})`,
              width: 320, height: 320, borderRadius: "50%",
              border: `2px solid ${palette.terracotta}`,
              opacity: (1 - p) * 0.4,
            }} />
          );
        })}

        <div style={{
          position: "relative", width: "100%", height: "100%",
          borderRadius: 44, background: palette.ink,
          padding: 12, boxShadow: "0 40px 90px rgba(31,29,26,0.35)",
        }}>
          <div style={{
            width: "100%", height: "100%", borderRadius: 34,
            background: `linear-gradient(160deg, ${palette.sage}22, ${palette.gold}22)`,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              padding: "60px 20px 20px", color: palette.ink,
              fontSize: 14, opacity: 0.6, fontWeight: 600,
            }}>
              9:42 · Salva Pasti
            </div>

            {/* Notification banner */}
            <div style={{
              margin: "20px 16px", padding: 16, borderRadius: 18,
              background: "white", boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
              transform: `scale(${notifSpring}) translateY(${interpolate(notifSpring, [0, 1], [-20, 0])}px)`,
              opacity: notifSpring,
              display: "flex", gap: 12, alignItems: "flex-start",
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: palette.terracotta, color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, flexShrink: 0,
              }}>📍</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: palette.ink }}>
                  Box disponibile vicino a te
                </div>
                <div style={{ fontSize: 12, color: palette.inkSoft, marginTop: 4, lineHeight: 1.4 }}>
                  Trattoria Da Lucia · 420m · 8 porzioni
                </div>
              </div>
            </div>

            {/* You-are-here dot */}
            <div style={{
              position: "absolute", left: "50%", top: "70%",
              transform: "translate(-50%, -50%)",
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                background: palette.sage, border: "4px solid white",
                boxShadow: `0 0 0 ${4 + Math.sin(frame / 6) * 6}px ${palette.sage}33`,
              }} />
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
