// Tone.js audio engine. All functions are client-side only and lazily
// create synths after the first user gesture to satisfy autoplay policies.
import * as Tone from "tone";
import { chordVoicing, guitarChordNotes } from "./music";

let pianoSynth: Tone.PolySynth | null = null;
let guitarSynth: Tone.PluckSynth | null = null;
let bassSynth: Tone.Synth | null = null;
let started = false;

async function ensureStarted() {
  if (!started) {
    await Tone.start();
    started = true;
  }
}

function getPiano(): Tone.PolySynth {
  if (!pianoSynth) {
    pianoSynth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: "triangle" },
      envelope: { attack: 0.01, decay: 0.4, sustain: 0.3, release: 1.4 },
    }).toDestination();
    pianoSynth.volume.value = -8;
  }
  return pianoSynth;
}

function getGuitar(): Tone.PluckSynth {
  if (!guitarSynth) {
    guitarSynth = new Tone.PluckSynth({
      attackNoise: 2,
      dampening: 4000,
      resonance: 0.9,
    }).toDestination();
    guitarSynth.volume.value = -2;
  }
  return guitarSynth;
}

function getBass(): Tone.Synth {
  if (!bassSynth) {
    bassSynth = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.6, release: 0.5 },
    }).toDestination();
    bassSynth.volume.value = -4;
  }
  return bassSynth;
}

// Play a piano chord from a chord symbol (e.g. "Am7").
export async function playPianoChord(symbol: string) {
  await ensureStarted();
  const notes = chordVoicing(symbol, 4);
  getPiano().triggerAttackRelease(notes, "2n");
}

// Strum a guitar chord defined by its fret positions (low E -> high E).
export async function playGuitarChord(
  frets: (number | "x")[],
  direction: "down" | "up" = "down"
) {
  await ensureStarted();
  const synth = getGuitar();
  const notes = guitarChordNotes(frets);
  const ordered = direction === "down" ? notes : [...notes].reverse();
  const delay = 0.035; // 35ms between strings
  ordered.forEach((note, i) => {
    setTimeout(() => {
      synth.triggerAttack(note);
    }, i * delay * 1000);
  });
}

// Play a bass line: a sequence of notes, quarter notes at the given BPM.
export async function playBassLine(notes: string[], bpm = 90) {
  await ensureStarted();
  const synth = getBass();
  const beat = 60 / bpm; // seconds per quarter note
  notes.forEach((note, i) => {
    setTimeout(() => {
      synth.triggerAttackRelease(note, "4n");
    }, i * beat * 1000);
  });
  // total duration so callers can sync UI if needed
  return notes.length * beat * 1000;
}
