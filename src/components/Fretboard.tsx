"use client";

// SVG guitar fretboard. `frets` is given 6th string (low E) -> 1st string (high E).
// Displayed with the high E string on top, a 5-fret window auto-positioned to
// the chord, dots in gold, open/muted markers to the left of the nut.

interface FretboardProps {
  frets: (number | "x")[];
  reveal?: boolean; // show the dots (after answering)
}

const STRING_GAP = 26;
const CELL_W = 46;
const BOARD_LEFT = 46;
const BOARD_TOP = 22;
const FRET_COUNT = 5;

const OPEN_STRING_NAMES = ["E", "B", "G", "D", "A", "E"]; // top (1st) -> bottom (6th)

export default function Fretboard({ frets, reveal = true }: FretboardProps) {
  const boardHeight = STRING_GAP * 5; // 6 strings, 5 gaps
  const boardWidth = CELL_W * FRET_COUNT;
  const width = BOARD_LEFT + boardWidth + 24;
  const height = BOARD_TOP + boardHeight + 34;

  const fretted = frets.filter(
    (f): f is number => typeof f === "number" && f > 0
  );
  const maxFret = fretted.length ? Math.max(...fretted) : 0;
  const minFret = fretted.length ? Math.min(...fretted) : 0;
  const baseFret = maxFret <= FRET_COUNT ? 0 : minFret - 1;

  const stringY = (row: number) => BOARD_TOP + row * STRING_GAP;

  const lines: React.ReactNode[] = [];

  // strings (horizontal)
  for (let r = 0; r < 6; r++) {
    lines.push(
      <line
        key={`s-${r}`}
        x1={BOARD_LEFT}
        y1={stringY(r)}
        x2={BOARD_LEFT + boardWidth}
        y2={stringY(r)}
        stroke="#5a5a5a"
        strokeWidth={1.3}
      />
    );
  }

  // frets (vertical)
  for (let c = 0; c <= FRET_COUNT; c++) {
    const x = BOARD_LEFT + c * CELL_W;
    const isNut = baseFret === 0 && c === 0;
    lines.push(
      <line
        key={`f-${c}`}
        x1={x}
        y1={stringY(0)}
        x2={x}
        y2={stringY(5)}
        stroke={isNut ? "#d4af37" : "#5a5a5a"}
        strokeWidth={isNut ? 5 : 1.3}
      />
    );
  }

  // open-string note labels (left)
  const labels = OPEN_STRING_NAMES.map((name, r) => (
    <text
      key={`l-${r}`}
      x={14}
      y={stringY(r) + 4}
      textAnchor="middle"
      fontSize={12}
      fill="#888"
    >
      {name}
    </text>
  ));

  // fret position numbers (below board)
  const fretNums: React.ReactNode[] = [];
  for (let c = 0; c < FRET_COUNT; c++) {
    const absFret = baseFret + c + 1;
    fretNums.push(
      <text
        key={`fn-${c}`}
        x={BOARD_LEFT + c * CELL_W + CELL_W / 2}
        y={stringY(5) + 24}
        textAnchor="middle"
        fontSize={11}
        fill="#666"
      >
        {absFret}
      </text>
    );
  }

  // markers / dots
  const markers: React.ReactNode[] = [];
  if (reveal) {
    frets.forEach((fret, i) => {
      // frets index 0 = low E (6th) = bottom row 5; index 5 = high E (1st) = row 0
      const row = 5 - i;
      const y = stringY(row);
      if (fret === "x") {
        markers.push(
          <text
            key={`m-${i}`}
            x={BOARD_LEFT - 18}
            y={y + 4}
            textAnchor="middle"
            fontSize={14}
            fill="#aaa"
          >
            ×
          </text>
        );
      } else if (fret === 0) {
        markers.push(
          <circle
            key={`m-${i}`}
            cx={BOARD_LEFT - 18}
            cy={y}
            r={6}
            fill="none"
            stroke="#d4af37"
            strokeWidth={1.6}
          />
        );
      } else {
        const col = fret - baseFret;
        const cx = BOARD_LEFT + (col - 0.5) * CELL_W;
        markers.push(
          <circle
            key={`m-${i}`}
            cx={cx}
            cy={y}
            r={10}
            fill="#d4af37"
            stroke="#0a0a0a"
            strokeWidth={1}
          />
        );
      }
    });
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      aria-label="ギターフレットボード"
      style={{ maxWidth: 360, height: "auto" }}
    >
      {lines}
      {labels}
      {fretNums}
      {markers}
    </svg>
  );
}
