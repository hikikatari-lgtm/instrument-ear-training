"use client";

// Horizontal guitar chord diagram (muuu.jp style).
// `frets` is 6th string (low E) -> 1st string (high E), index 0..5.
// Strings are horizontal: top row = 1st string (high E), bottom = 6th (low E).
// Frets are vertical lines: left = nut/head, right = body.
// Fret numbers run along the bottom; open (○) / muted (×) markers sit at the
// left edge; barres are drawn as a vertical bar; the nut is a thick left line.

interface ChordDiagramProps {
  frets: (number | "x")[];
  name?: string;
  showName?: boolean;
}

const ROW_GAP = 26; // vertical spacing between strings
const CELL_W = 46; // fret (column) width
const BOARD_LEFT = 42; // room for ○ / × markers
const BOARD_TOP = 22;
const FRET_COUNT = 4;
const NUM_STRINGS = 6;

export default function ChordDiagram({
  frets,
  name,
  showName = false,
}: ChordDiagramProps) {
  const boardWidth = CELL_W * FRET_COUNT;
  const boardHeight = ROW_GAP * (NUM_STRINGS - 1);
  const width = BOARD_LEFT + boardWidth + 22;
  const height = BOARD_TOP + boardHeight + 32;

  const fretted = frets.filter(
    (f): f is number => typeof f === "number" && f > 0
  );
  const maxFret = fretted.length ? Math.max(...fretted) : 0;
  const minFret = fretted.length ? Math.min(...fretted) : 0;
  const baseFret = maxFret <= FRET_COUNT ? 0 : minFret - 1;

  // string array index i (0 = low E / 6th) -> row (0 = top = high E / 1st)
  const rowY = (i: number) => BOARD_TOP + (NUM_STRINGS - 1 - i) * ROW_GAP;
  const fretX = (col: number) => BOARD_LEFT + col * CELL_W; // grid line x
  const dotX = (fret: number) => BOARD_LEFT + (fret - baseFret - 0.5) * CELL_W;

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

  // strings (horizontal lines)
  for (let i = 0; i < NUM_STRINGS; i++) {
    els.push(
      <line
        key={`str-${i}`}
        x1={BOARD_LEFT}
        y1={rowY(i)}
        x2={BOARD_LEFT + boardWidth}
        y2={rowY(i)}
        stroke="#6a6a6a"
        strokeWidth={1.3}
      />
    );
  }

  // frets (vertical lines)
  for (let c = 0; c <= FRET_COUNT; c++) {
    const isNut = baseFret === 0 && c === 0;
    els.push(
      <line
        key={`fr-${c}`}
        x1={fretX(c)}
        y1={rowY(NUM_STRINGS - 1)}
        x2={fretX(c)}
        y2={rowY(0)}
        stroke={isNut ? "#d4af37" : "#6a6a6a"}
        strokeWidth={isNut ? 6 : 1.3}
      />
    );
  }

  // fret numbers below the board (absolute fret position)
  for (let c = 1; c <= FRET_COUNT; c++) {
    els.push(
      <text
        key={`fn-${c}`}
        x={BOARD_LEFT + (c - 0.5) * CELL_W}
        y={rowY(NUM_STRINGS - 1) + 24}
        textAnchor="middle"
        fontSize={11}
        fill="#888"
      >
        {baseFret + c}
      </text>
    );
  }

  // open / muted markers at the left edge
  frets.forEach((f, i) => {
    const x = BOARD_LEFT - 18;
    const y = rowY(i);
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

  // barre (vertical bar across the spanned strings at one fret)
  if (barre) {
    const yTop = rowY(barre.to); // higher string index -> higher on screen
    const yBottom = rowY(barre.from);
    els.push(
      <rect
        key="barre"
        x={dotX(barre.fret) - 9}
        y={yTop - 9}
        width={18}
        height={yBottom - yTop + 18}
        rx={9}
        fill="#d4af37"
      />
    );
  }

  // finger dots
  frets.forEach((f, i) => {
    if (typeof f !== "number" || f <= 0) return;
    els.push(
      <circle
        key={`dot-${i}`}
        cx={dotX(f)}
        cy={rowY(i)}
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
        style={{ maxWidth: 280, height: "auto" }}
      >
        {els}
      </svg>
    </div>
  );
}
