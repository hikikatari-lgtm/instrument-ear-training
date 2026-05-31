"use client";

// Standard vertical guitar chord diagram.
// `frets` is 6th string (low E) -> 1st string (high E). Columns run left
// (low E) to right (high E); fret rows run downward from the nut. Barres are
// drawn as a bar; muted (×) / open (○) markers sit above the nut.

interface ChordDiagramProps {
  frets: (number | "x")[];
  name?: string;
  showName?: boolean;
}

const COL_GAP = 30;
const ROW_GAP = 34;
const BOARD_LEFT = 34;
const BOARD_TOP = 40;
const ROWS = 5;
const NUM_STRINGS = 6;

export default function ChordDiagram({
  frets,
  name,
  showName = false,
}: ChordDiagramProps) {
  const boardWidth = COL_GAP * (NUM_STRINGS - 1);
  const boardHeight = ROW_GAP * ROWS;
  const width = BOARD_LEFT + boardWidth + 34;
  const height = BOARD_TOP + boardHeight + 28;

  const fretted = frets.filter(
    (f): f is number => typeof f === "number" && f > 0
  );
  const maxFret = fretted.length ? Math.max(...fretted) : 0;
  const minFret = fretted.length ? Math.min(...fretted) : 0;
  const baseFret = maxFret <= ROWS ? 0 : minFret - 1;

  const colX = (i: number) => BOARD_LEFT + i * COL_GAP;
  const rowLineY = (r: number) => BOARD_TOP + r * ROW_GAP;

  // barre detection: lowest fret shared across a contiguous span of >=3
  // strings with no open / muted string inside that span.
  const atMin: number[] = [];
  frets.forEach((f, i) => {
    if (f === minFret && minFret > 0) atMin.push(i);
  });
  let barre: { from: number; to: number; fret: number } | null = null;
  if (atMin.length >= 2) {
    const from = Math.min(...atMin);
    const to = Math.max(...atMin);
    let blocked = false;
    for (let i = from; i <= to; i++) {
      if (frets[i] === "x" || frets[i] === 0) blocked = true;
    }
    if (!blocked && to - from >= 2) barre = { from, to, fret: minFret };
  }

  const els: React.ReactNode[] = [];

  // strings (vertical)
  for (let i = 0; i < NUM_STRINGS; i++) {
    els.push(
      <line
        key={`str-${i}`}
        x1={colX(i)}
        y1={rowLineY(0)}
        x2={colX(i)}
        y2={rowLineY(ROWS)}
        stroke="#6a6a6a"
        strokeWidth={1.3}
      />
    );
  }

  // fret lines (horizontal)
  for (let r = 0; r <= ROWS; r++) {
    const isNut = baseFret === 0 && r === 0;
    els.push(
      <line
        key={`fr-${r}`}
        x1={colX(0)}
        y1={rowLineY(r)}
        x2={colX(NUM_STRINGS - 1)}
        y2={rowLineY(r)}
        stroke={isNut ? "#d4af37" : "#6a6a6a"}
        strokeWidth={isNut ? 5 : 1.3}
      />
    );
  }

  // position label (e.g. "3fr") when the window starts above the nut
  if (baseFret > 0) {
    els.push(
      <text
        key="basefret"
        x={colX(0) - 14}
        y={rowLineY(0) + ROW_GAP / 2 + 4}
        textAnchor="middle"
        fontSize={12}
        fill="#d4af37"
      >
        {baseFret + 1}fr
      </text>
    );
  }

  // open / muted markers above the nut
  frets.forEach((f, i) => {
    const x = colX(i);
    const y = BOARD_TOP - 14;
    if (f === "x") {
      els.push(
        <text
          key={`mk-${i}`}
          x={x}
          y={y + 4}
          textAnchor="middle"
          fontSize={14}
          fill="#aaa"
        >
          ×
        </text>
      );
    } else if (f === 0) {
      els.push(
        <circle
          key={`mk-${i}`}
          cx={x}
          cy={y}
          r={5.5}
          fill="none"
          stroke="#d4af37"
          strokeWidth={1.6}
        />
      );
    }
  });

  // barre bar
  if (barre) {
    const row = barre.fret - baseFret;
    const cy = rowLineY(0) + (row - 0.5) * ROW_GAP;
    els.push(
      <rect
        key="barre"
        x={colX(barre.from) - 9}
        y={cy - 9}
        width={colX(barre.to) - colX(barre.from) + 18}
        height={18}
        rx={9}
        fill="#d4af37"
      />
    );
  }

  // finger dots
  frets.forEach((f, i) => {
    if (typeof f !== "number" || f <= 0) return;
    const row = f - baseFret;
    const cy = rowLineY(0) + (row - 0.5) * ROW_GAP;
    els.push(
      <circle
        key={`dot-${i}`}
        cx={colX(i)}
        cy={cy}
        r={8.5}
        fill="#d4af37"
        stroke="#0a0a0a"
        strokeWidth={1}
      />
    );
  });

  return (
    <div className="flex flex-col items-center">
      {showName && name && (
        <p className="mb-1 text-lg font-bold text-gold">{name}</p>
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        role="img"
        aria-label="ギターコードダイアグラム"
        style={{ maxWidth: 220, height: "auto" }}
      >
        {els}
      </svg>
    </div>
  );
}
