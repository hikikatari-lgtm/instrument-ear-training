// Music theory helpers: chord symbol -> notes / pitch classes.

// Semitone index for every note spelling we use.
const NOTE_TO_SEMITONE: Record<string, number> = {
  C: 0,
  "B#": 0,
  "C#": 1,
  Db: 1,
  D: 2,
  "D#": 3,
  Eb: 3,
  E: 4,
  Fb: 4,
  F: 5,
  "E#": 5,
  "F#": 6,
  Gb: 6,
  G: 7,
  "G#": 8,
  Ab: 8,
  A: 9,
  "A#": 10,
  Bb: 10,
  B: 11,
  Cb: 11,
};

// Preferred display name per pitch class (sharps).
const SEMITONE_TO_NAME = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export type ChordQuality = "major" | "minor" | "dom7" | "maj7" | "min7";

const QUALITY_INTERVALS: Record<ChordQuality, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  dom7: [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
};

export interface ParsedChord {
  root: string;
  quality: ChordQuality;
}

// Parse a symbol like "C", "Am", "G7", "FM7", "Dm7", "BbM7".
export function parseChord(symbol: string): ParsedChord {
  // Strip a slash bass if present ("C/E" -> "C").
  const base = symbol.split("/")[0].trim();
  const match = base.match(/^([A-G][b#]?)(.*)$/);
  if (!match) {
    return { root: "C", quality: "major" };
  }
  const root = match[1];
  const suffix = match[2];

  let quality: ChordQuality;
  if (suffix === "M7" || suffix === "maj7") {
    quality = "maj7";
  } else if (suffix === "m7" || suffix === "min7") {
    quality = "min7";
  } else if (suffix === "7") {
    quality = "dom7";
  } else if (suffix === "m" || suffix === "min") {
    quality = "minor";
  } else {
    quality = "major";
  }
  return { root, quality };
}

// Pitch classes (0-11) that make up the chord.
export function chordPitchClasses(symbol: string): number[] {
  const { root, quality } = parseChord(symbol);
  const rootSemi = NOTE_TO_SEMITONE[root] ?? 0;
  return QUALITY_INTERVALS[quality].map((i) => (rootSemi + i) % 12);
}

// Display note names for the chord tones.
export function chordNoteNames(symbol: string): string[] {
  return chordPitchClasses(symbol).map((pc) => SEMITONE_TO_NAME[pc]);
}

// Voiced notes (with octave) for audio playback, root near the given octave.
export function chordVoicing(symbol: string, rootOctave = 4): string[] {
  const { root, quality } = parseChord(symbol);
  const rootSemi = NOTE_TO_SEMITONE[root] ?? 0;
  return QUALITY_INTERVALS[quality].map((interval) => {
    const abs = rootSemi + interval;
    const octave = rootOctave + Math.floor(abs / 12);
    const name = SEMITONE_TO_NAME[abs % 12];
    return `${name}${octave}`;
  });
}

export function pitchClassOf(note: string): number {
  const match = note.match(/^([A-G][b#]?)/);
  if (!match) return 0;
  return NOTE_TO_SEMITONE[match[1]] ?? 0;
}

// Convert a note name (e.g. "C4", "F#3") to a MIDI number.
export function noteToMidi(note: string): number {
  const match = note.match(/^([A-G][b#]?)(-?\d+)$/);
  if (!match) return 60;
  const pc = NOTE_TO_SEMITONE[match[1]] ?? 0;
  const octave = parseInt(match[2], 10);
  return (octave + 1) * 12 + pc;
}

export function midiToNote(midi: number): string {
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  return `${SEMITONE_TO_NAME[pc]}${octave}`;
}

// Standard guitar tuning, 6th string (low E) -> 1st string (high E).
const GUITAR_TUNING_MIDI = [
  noteToMidi("E2"),
  noteToMidi("A2"),
  noteToMidi("D3"),
  noteToMidi("G3"),
  noteToMidi("B3"),
  noteToMidi("E4"),
];

// Given a frets array (low E -> high E), return the sounding notes (low -> high).
export function guitarChordNotes(frets: (number | "x")[]): string[] {
  const notes: string[] = [];
  frets.forEach((fret, i) => {
    if (fret === "x") return;
    const midi = GUITAR_TUNING_MIDI[i] + fret;
    notes.push(midiToNote(midi));
  });
  return notes;
}

// Standard 4-string bass tuning (low -> high): E1 A1 D2 G2.
const BASS_TUNING_MIDI = [
  noteToMidi("E1"),
  noteToMidi("A1"),
  noteToMidi("D2"),
  noteToMidi("G2"),
];

export interface BassPosition {
  string: number; // 0 = low E ... 3 = high G
  fret: number;
  label: string; // note name without octave
}

// Pick a playable bass position for a note: the smallest fret across the four
// strings (preferring the thicker string on ties).
export function bassPosition(note: string): BassPosition {
  const midi = noteToMidi(note);
  let best: BassPosition | null = null;
  for (let s = 0; s < 4; s++) {
    const fret = midi - BASS_TUNING_MIDI[s];
    if (fret >= 0 && fret <= 16) {
      if (!best || fret < best.fret) {
        best = { string: s, fret, label: note.replace(/-?\d+$/, "") };
      }
    }
  }
  return best ?? { string: 0, fret: 0, label: note.replace(/-?\d+$/, "") };
}

export { SEMITONE_TO_NAME };
