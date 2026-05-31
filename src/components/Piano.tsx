"use client";

// SVG piano keyboard spanning C3..B4 (two octaves).
// `highlight` keys (upper chord tones) are gold; `rootHighlight` keys (the bass
// root) are red, so the left-hand root reads distinctly from the right hand.

interface PianoProps {
  highlight?: number[]; // pitch classes 0-11 — upper chord tones (gold)
  rootHighlight?: number[]; // pitch classes 0-11 — root (red)
  showLabels?: boolean;
}

const GOLD = "#d4af37";
const ROOT_RED = "#e0533d";

const WHITE_W = 40;
const WHITE_H = 170;
const BLACK_W = 26;
const BLACK_H = 105;

const WHITE_DEFS = [
  { name: "C", pc: 0 },
  { name: "D", pc: 2 },
  { name: "E", pc: 4 },
  { name: "F", pc: 5 },
  { name: "G", pc: 7 },
  { name: "A", pc: 9 },
  { name: "B", pc: 11 },
];

// black key after these white-key indices, with their pitch classes
const BLACK_DEFS: Record<number, { name: string; pc: number }> = {
  0: { name: "C#", pc: 1 },
  1: { name: "D#", pc: 3 },
  3: { name: "F#", pc: 6 },
  4: { name: "G#", pc: 8 },
  5: { name: "A#", pc: 10 },
};

const OCTAVES = [3, 4];

export default function Piano({
  highlight = [],
  rootHighlight = [],
  showLabels = true,
}: PianoProps) {
  const hi = new Set(highlight);
  const rootHi = new Set(rootHighlight);
  const totalWhite = WHITE_DEFS.length * OCTAVES.length;
  const width = totalWhite * WHITE_W;

  const whiteKeys: React.ReactNode[] = [];
  const blackKeys: React.ReactNode[] = [];

  OCTAVES.forEach((octave, octIdx) => {
    WHITE_DEFS.forEach((def, i) => {
      const index = octIdx * WHITE_DEFS.length + i;
      const x = index * WHITE_W;
      const isRoot = rootHi.has(def.pc);
      const on = isRoot || hi.has(def.pc);
      whiteKeys.push(
        <g key={`w-${octave}-${def.name}`}>
          <rect
            x={x}
            y={0}
            width={WHITE_W}
            height={WHITE_H}
            rx={3}
            fill={isRoot ? ROOT_RED : hi.has(def.pc) ? GOLD : "#f5f5f3"}
            stroke="#0a0a0a"
            strokeWidth={1.5}
          />
          {showLabels && (
            <text
              x={x + WHITE_W / 2}
              y={WHITE_H - 12}
              textAnchor="middle"
              fontSize={12}
              fontWeight={on ? 700 : 400}
              fill={on ? "#0a0a0a" : "#888"}
            >
              {def.name}
              {octave}
            </text>
          )}
        </g>
      );

      const black = BLACK_DEFS[i];
      if (black) {
        const bx = (index + 1) * WHITE_W - BLACK_W / 2;
        const isRoot2 = rootHi.has(black.pc);
        const on2 = isRoot2 || hi.has(black.pc);
        blackKeys.push(
          <g key={`b-${octave}-${black.name}`}>
            <rect
              x={bx}
              y={0}
              width={BLACK_W}
              height={BLACK_H}
              rx={3}
              fill={isRoot2 ? ROOT_RED : hi.has(black.pc) ? GOLD : "#161616"}
              stroke="#000"
              strokeWidth={1.5}
            />
            {showLabels && on2 && (
              <text
                x={bx + BLACK_W / 2}
                y={BLACK_H - 10}
                textAnchor="middle"
                fontSize={10}
                fontWeight={700}
                fill="#0a0a0a"
              >
                {black.name}
              </text>
            )}
          </g>
        );
      }
    });
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${WHITE_H}`}
      width="100%"
      role="img"
      aria-label="ピアノ鍵盤"
      style={{ maxWidth: "100%", height: "auto" }}
    >
      {whiteKeys}
      {blackKeys}
    </svg>
  );
}
