"use client";

// SVG piano keyboard spanning C3..B4 (two octaves).
// `highlight` keys (upper chord tones) are gold with their note name.
// `rootPc` (the left-hand root) is shown in red on a SINGLE key — the lowest
// occurrence on the keyboard — and labelled "R" instead of its note name.

interface PianoProps {
  highlight?: number[]; // pitch classes 0-11 — upper chord tones (gold)
  rootPc?: number | null; // pitch class 0-11 — root (red, single key, "R")
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
  rootPc = null,
  showLabels = true,
}: PianoProps) {
  const hi = new Set(highlight);
  const totalWhite = WHITE_DEFS.length * OCTAVES.length;
  const width = totalWhite * WHITE_W;

  // The root is drawn red on a single key only — the first (lowest) occurrence.
  let rootPlaced = false;

  const whiteKeys: React.ReactNode[] = [];
  const blackKeys: React.ReactNode[] = [];

  OCTAVES.forEach((octave, octIdx) => {
    WHITE_DEFS.forEach((def, i) => {
      const index = octIdx * WHITE_DEFS.length + i;
      const x = index * WHITE_W;
      const isRoot = rootPc != null && def.pc === rootPc && !rootPlaced;
      if (isRoot) rootPlaced = true;
      const isGold = !isRoot && hi.has(def.pc);
      const on = isRoot || isGold;
      whiteKeys.push(
        <g key={`w-${octave}-${def.name}`}>
          <rect
            x={x}
            y={0}
            width={WHITE_W}
            height={WHITE_H}
            rx={3}
            fill={isRoot ? ROOT_RED : isGold ? GOLD : "#f5f5f3"}
            stroke="#0a0a0a"
            strokeWidth={1.5}
          />
          {showLabels && (
            <text
              x={x + WHITE_W / 2}
              y={WHITE_H - 12}
              textAnchor="middle"
              fontSize={isRoot ? 14 : 12}
              fontWeight={on ? 700 : 400}
              fill={isRoot ? "#fff" : on ? "#0a0a0a" : "#888"}
            >
              {isRoot ? "R" : `${def.name}${octave}`}
            </text>
          )}
        </g>
      );

      const black = BLACK_DEFS[i];
      if (black) {
        const bx = (index + 1) * WHITE_W - BLACK_W / 2;
        const isRoot2 = rootPc != null && black.pc === rootPc && !rootPlaced;
        if (isRoot2) rootPlaced = true;
        const isGold2 = !isRoot2 && hi.has(black.pc);
        const on2 = isRoot2 || isGold2;
        blackKeys.push(
          <g key={`b-${octave}-${black.name}`}>
            <rect
              x={bx}
              y={0}
              width={BLACK_W}
              height={BLACK_H}
              rx={3}
              fill={isRoot2 ? ROOT_RED : isGold2 ? GOLD : "#161616"}
              stroke="#000"
              strokeWidth={1.5}
            />
            {showLabels && on2 && (
              <text
                x={bx + BLACK_W / 2}
                y={BLACK_H - 10}
                textAnchor="middle"
                fontSize={isRoot2 ? 12 : 10}
                fontWeight={700}
                fill={isRoot2 ? "#fff" : "#0a0a0a"}
              >
                {isRoot2 ? "R" : black.name}
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
