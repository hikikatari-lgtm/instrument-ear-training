"use client";

// 4-string bass fretboard. Shows the whole root sequence as faint outline
// dots; the currently sounding root lights up gold (driven by `activeIndex`).

import { BassPosition } from "@/lib/music";

interface BassFretboardProps {
  positions: BassPosition[];
  activeIndex: number | null;
}

const STRING_GAP = 22;
const CELL_W = 34;
const BOARD_LEFT = 40;
const BOARD_TOP = 18;
const STRING_NAMES = ["G", "D", "A", "E"]; // top -> bottom (high -> low)
const INLAY_FRETS = [3, 5, 7, 9, 12];

export default function BassFretboard({
  positions,
  activeIndex,
}: BassFretboardProps) {
  const maxFret = positions.reduce((m, p) => Math.max(m, p.fret), 0);
  const windowFrets = Math.min(13, Math.max(5, maxFret + 1));

  const boardWidth = CELL_W * windowFrets;
  const boardHeight = STRING_GAP * 3; // 4 strings, 3 gaps
  const width = BOARD_LEFT + boardWidth + 18;
  const height = BOARD_TOP + boardHeight + 30;

  // string index 0 = low E -> bottom row 3; 3 = high G -> top row 0
  const rowY = (stringIndex: number) =>
    BOARD_TOP + (3 - stringIndex) * STRING_GAP;
  const fretCenterX = (fret: number) =>
    fret === 0 ? BOARD_LEFT - 18 : BOARD_LEFT + (fret - 0.5) * CELL_W;

  const els: React.ReactNode[] = [];

  // inlay dots
  INLAY_FRETS.filter((f) => f <= windowFrets).forEach((f) => {
    els.push(
      <circle
        key={`inlay-${f}`}
        cx={BOARD_LEFT + (f - 0.5) * CELL_W}
        cy={BOARD_TOP + boardHeight / 2}
        r={3}
        fill="#333"
      />
    );
  });

  // strings (horizontal)
  for (let r = 0; r < 4; r++) {
    els.push(
      <line
        key={`s-${r}`}
        x1={BOARD_LEFT}
        y1={BOARD_TOP + r * STRING_GAP}
        x2={BOARD_LEFT + boardWidth}
        y2={BOARD_TOP + r * STRING_GAP}
        stroke="#5a5a5a"
        strokeWidth={1.3 + (3 - r) * 0.35}
      />
    );
  }

  // frets (vertical)
  for (let c = 0; c <= windowFrets; c++) {
    const x = BOARD_LEFT + c * CELL_W;
    const isNut = c === 0;
    els.push(
      <line
        key={`f-${c}`}
        x1={x}
        y1={rowY(3)}
        x2={x}
        y2={rowY(0)}
        stroke={isNut ? "#d4af37" : "#4a4a4a"}
        strokeWidth={isNut ? 4 : 1.2}
      />
    );
  }

  // string name labels
  STRING_NAMES.forEach((nm, r) => {
    els.push(
      <text
        key={`l-${r}`}
        x={14}
        y={BOARD_TOP + r * STRING_GAP + 4}
        textAnchor="middle"
        fontSize={11}
        fill="#888"
      >
        {nm}
      </text>
    );
  });

  // fret numbers
  for (let c = 1; c <= windowFrets; c++) {
    els.push(
      <text
        key={`fn-${c}`}
        x={BOARD_LEFT + (c - 0.5) * CELL_W}
        y={rowY(3) + 22}
        textAnchor="middle"
        fontSize={9}
        fill="#666"
      >
        {c}
      </text>
    );
  }

  // faint outline dots for every root in the sequence
  positions.forEach((p, i) => {
    if (i === activeIndex) return;
    els.push(
      <circle
        key={`dim-${i}`}
        cx={fretCenterX(p.fret)}
        cy={rowY(p.string)}
        r={8}
        fill="none"
        stroke="#7a6a35"
        strokeWidth={1.4}
      />
    );
  });

  // active root (gold, on top)
  if (activeIndex != null && positions[activeIndex]) {
    const p = positions[activeIndex];
    els.push(
      <g key="active">
        <circle
          cx={fretCenterX(p.fret)}
          cy={rowY(p.string)}
          r={11}
          fill="#d4af37"
          stroke="#0a0a0a"
          strokeWidth={1}
        />
        <text
          x={fretCenterX(p.fret)}
          y={rowY(p.string) + 4}
          textAnchor="middle"
          fontSize={10}
          fontWeight={700}
          fill="#0a0a0a"
        >
          {p.label}
        </text>
      </g>
    );
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      role="img"
      aria-label="ベースフレットボード"
      style={{ maxWidth: 460, height: "auto" }}
    >
      {els}
    </svg>
  );
}
