import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { fonts, palette } from "../MainVideo";

const PINS = [
  { x: 28, y: 38, delay: 18 },
  { x: 55, y: 30, delay: 26 },
  { x: 70, y: 55, delay: 34 },
  { x: 38, y: 62, delay: 42 },
  { x: 60, y: 75, delay: 50 },
];

export const SceneMappa: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOpacity = interpolate(frame, [6, 24], [0, 1], { extrapolateRight: "clamp" });
  const mapSpring = spring({ frame: frame - 10, fps, config: { damping: 20 } });

  return (
    <AbsoluteFill style={{ padding: 80, flexDirection: "row", gap: 60 }}>
      <div style={{ flex: 1, alignSelf: "center" }}>
        <div style={{
          fontFamily: fonts.display, fontSize: 200, lineHeight: 0.9,
          color: palette.terracotta, fontStyle: "italic",
          opacity: headerOpacity,
        }}>
          02
        </div>
        <div style={{
          fontFamily: fonts.display, fontSize: 78, lineHeight: 1, marginTop: 12,
          color: palette.ink, fontStyle: "italic",
          opacity: interpolate(frame, [20, 36], [0, 1], { extrapolateRight: "clamp" }),
          transform: `translateY(${interpolate(frame, [20, 36], [16, 0], { extrapolateRight: "clamp" })}px)`,
        }}>
          Le vedi<br/>sulla mappa
        </div>
        <div style={{
          marginTop: 24, fontSize: 24, color: palette.inkSoft, maxWidth: 460,
          opacity: interpolate(frame, [40, 58], [0, 1], { extrapolateRight: "clamp" }),
        }}>
          Le box appaiono in tempo reale nella tua zona. Quando sei vicino,
          ti arriva una notifica.
        </div>
      </div>

      {/* Map mock */}
      <div style={{
        width: 540, height: 520, alignSelf: "center", borderRadius: 28,
        background: `linear-gradient(135deg, ${palette.sage}22, ${palette.gold}22)`,
        border: `1px solid ${palette.ink}15`, position: "relative",
        boxShadow: "0 30px 80px rgba(31,29,26,0.15)",
        transform: `scale(${interpolate(mapSpring, [0, 1], [0.85, 1])})`,
        opacity: interpolate(frame, [10, 28], [0, 1], { extrapolateRight: "clamp" }),
        overflow: "hidden",
      }}>
        {/* Grid lines */}
        {[20, 40, 60, 80].map((p) => (
          <div key={`h${p}`} style={{ position: "absolute", left: 0, right: 0, top: `${p}%`, height: 1, background: palette.ink, opacity: 0.06 }} />
        ))}
        {[20, 40, 60, 80].map((p) => (
          <div key={`v${p}`} style={{ position: "absolute", top: 0, bottom: 0, left: `${p}%`, width: 1, background: palette.ink, opacity: 0.06 }} />
        ))}

        {/* Pins */}
        {PINS.map((p, i) => {
          const s = spring({ frame: frame - p.delay, fps, config: { damping: 12, stiffness: 180 } });
          const pulse = 1 + Math.sin((frame - p.delay) / 8) * 0.15;
          return (
            <div key={i} style={{
              position: "absolute", left: `${p.x}%`, top: `${p.y}%`,
              transform: `translate(-50%, -50%) scale(${s * pulse})`,
            }}>
              <div style={{
                position: "absolute", inset: -18, borderRadius: "50%",
                background: palette.terracotta, opacity: 0.18,
              }} />
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: palette.terracotta, border: "3px solid white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              }} />
            </div>
          );
        })}

        {/* You-are-here marker */}
        <div style={{
          position: "absolute", left: "45%", top: "50%",
          transform: "translate(-50%, -50%)",
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: "50%",
            background: palette.sage, border: "3px solid white",
            boxShadow: `0 0 0 ${4 + Math.sin(frame / 6) * 4}px ${palette.sage}33`,
          }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
