// Tone.js audio engine. All functions are client-side only and lazily
// create synths after the first user gesture to satisfy autoplay policies.
import * as Tone from "tone";
import {
  chordVoicingSplit,
  guitarChordNotes,
  noteToMidi,
  midiToNote,
} from "./music";

let started = false;

async function ensureStarted() {
  if (!started) {
    await Tone.start();
    started = true;
  }
}

// ---- Piano -----------------------------------------------------------------

let pianoSynth: Tone.PolySynth | null = null;

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

// Play the chord as left-hand root (low) + right-hand upper tones (mid), so it
// is clearly grounded rather than sounding bunched up in a high octave.
export async function playPianoChord(symbol: string) {
  await ensureStarted();
  const { leftHand, rightHand } = chordVoicingSplit(symbol, 2, 4);
  getPiano().triggerAttackRelease([leftHand, ...rightHand], "2n");
}

export function stopPiano() {
  pianoSynth?.releaseAll();
}

// ---- Guitar ----------------------------------------------------------------

// One PluckSynth voice per string so the strings ring together (a single
// monophonic PluckSynth would cut each previous note, killing the arpeggio).
let guitarVoices: Tone.PluckSynth[] = [];
let guitarGain: Tone.Gain | null = null;

function getGuitarVoices(): Tone.PluckSynth[] {
  if (guitarVoices.length === 0) {
    guitarGain = new Tone.Gain(1).toDestination();
    for (let i = 0; i < 6; i++) {
      const v = new Tone.PluckSynth({
        attackNoise: 1.2,
        dampening: 5200,
        resonance: 0.96, // high resonance -> strings sustain / ring out
      }).connect(guitarGain);
      v.volume.value = -3;
      guitarVoices.push(v);
    }
  }
  return guitarVoices;
}

// Arpeggiate the chord from the 6th string (low) to the 1st (high), letting the
// strings ring — a guitar-like "ジャラーン" rather than a tight strum.
export async function playGuitarChord(frets: (number | "x")[]) {
  await ensureStarted();
  const voices = getGuitarVoices();
  if (guitarGain) guitarGain.gain.setValueAtTime(1, Tone.now());
  const notes = guitarChordNotes(frets); // low E (6th) -> high E (1st)
  const start = Tone.now();
  const step = 0.03; // 30ms between strings
  notes.forEach((note, i) => {
    voices[i % voices.length].triggerAttack(note, start + i * step);
  });
}

export function stopGuitar() {
  if (!guitarGain) return;
  const now = Tone.now();
  guitarGain.gain.cancelScheduledValues(now);
  guitarGain.gain.setValueAtTime(0, now);
  // restore so the next arpeggio is audible
  setTimeout(() => {
    if (guitarGain) guitarGain.gain.setValueAtTime(1, Tone.now());
  }, 160);
}

// ---- Bass groove (bass + rock drums via Transport) -------------------------

interface BassRig {
  bass: Tone.Synth;
  kick: Tone.MembraneSynth;
  snareNoise: Tone.NoiseSynth;
  snareBody: Tone.MembraneSynth;
  hihat: Tone.NoiseSynth;
}

let bassRig: BassRig | null = null;
let bassParts: { dispose: () => void }[] = [];
// UI highlight timers, driven by setTimeout rather than Tone.Draw so the
// keyboard/fretboard highlight stays reliable even when requestAnimationFrame
// is throttled (e.g. background tab). Audio stays sample-accurate on Transport.
let bassUiTimers: ReturnType<typeof setTimeout>[] = [];

function getBassRig(): BassRig {
  if (bassRig) return bassRig;

  // Overdriven pick bass: sawtooth -> lowpass -> light distortion.
  const dist = new Tone.Distortion(0.3).toDestination();
  dist.wet.value = 0.35;
  const filter = new Tone.Filter(2400, "lowpass").connect(dist);
  const bass = new Tone.Synth({
    oscillator: { type: "sawtooth" },
    envelope: { attack: 0.012, decay: 0.18, sustain: 0.7, release: 0.3 },
  }).connect(filter);
  bass.volume.value = -7;

  const kick = new Tone.MembraneSynth({
    octaves: 6,
    pitchDecay: 0.05,
  }).toDestination();
  kick.volume.value = -4;

  const snareNoise = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.18, sustain: 0 },
  }).toDestination();
  snareNoise.volume.value = -13;

  const snareBody = new Tone.MembraneSynth({
    octaves: 4,
    pitchDecay: 0.02,
  }).toDestination();
  snareBody.volume.value = -18;

  const hihatFilter = new Tone.Filter(8000, "highpass").toDestination();
  const hihat = new Tone.NoiseSynth({
    noise: { type: "white" },
    envelope: { attack: 0.001, decay: 0.05, sustain: 0 },
  }).connect(hihatFilter);
  hihat.volume.value = -20;

  bassRig = { bass, kick, snareNoise, snareBody, hihat };
  return bassRig;
}

export function stopBassGroove() {
  const transport = Tone.getTransport();
  transport.stop();
  transport.cancel(0);
  transport.position = 0;
  bassParts.forEach((p) => {
    try {
      p.dispose();
    } catch {
      // already disposed
    }
  });
  bassParts = [];
  bassUiTimers.forEach((t) => clearTimeout(t));
  bassUiTimers = [];
}

interface BassGrooveCallbacks {
  onStep?: (index: number) => void;
  onEnd?: () => void;
}

// Play a chord progression on bass in sync with a rock drum kit. Each chord
// gets a full bar (4 beats), so the changes are slow enough to hear:
// root(1) -> 5th(2) -> root octave-up(3) -> 5th(4). A one-bar hi-hat count-in
// precedes the groove; `onStep` fires per chord (UI-synced) as each bar starts.
export async function playBassGroove(
  roots: string[],
  bpm = 110,
  cb: BassGrooveCallbacks = {}
) {
  await ensureStarted();
  stopBassGroove();

  const rig = getBassRig();
  const transport = Tone.getTransport();
  transport.bpm.value = bpm;
  transport.position = 0;

  const numChords = roots.length;

  // Bass pattern per chord: root, 5th, root+octave, 5th (one note per beat).
  const bassEvents: { time: string; pitch: string }[] = [];
  roots.forEach((rootNote, ci) => {
    const rootMidi = noteToMidi(rootNote);
    const root = midiToNote(rootMidi);
    const fifth = midiToNote(rootMidi + 7);
    const octave = midiToNote(rootMidi + 12);
    const bar = 1 + ci; // bar 0 is the count-in
    bassEvents.push(
      { time: `${bar}:0:0`, pitch: root },
      { time: `${bar}:1:0`, pitch: fifth },
      { time: `${bar}:2:0`, pitch: octave },
      { time: `${bar}:3:0`, pitch: fifth }
    );
  });

  const kickEvents: { time: string }[] = [];
  const snareEvents: { time: string }[] = [];
  const hihatEvents: { time: string }[] = [];

  // count-in: four hi-hats on bar 0 (チッチッチッチッ)
  for (let beat = 0; beat < 4; beat++) {
    hihatEvents.push({ time: `0:${beat}:0` });
  }
  // rock drums: one bar per chord
  for (let b = 0; b < numChords; b++) {
    const bar = 1 + b;
    kickEvents.push({ time: `${bar}:0:0` }, { time: `${bar}:2:0` });
    snareEvents.push({ time: `${bar}:1:0` }, { time: `${bar}:3:0` });
    for (let beat = 0; beat < 4; beat++) {
      hihatEvents.push({ time: `${bar}:${beat}:0` }, { time: `${bar}:${beat}:2` });
    }
  }

  const bassPart = new Tone.Part((time, ev: { pitch: string }) => {
    rig.bass.triggerAttackRelease(ev.pitch, "4n", time);
  }, bassEvents);

  const kickPart = new Tone.Part((time) => {
    rig.kick.triggerAttackRelease("C1", "8n", time);
  }, kickEvents);

  const snarePart = new Tone.Part((time) => {
    rig.snareNoise.triggerAttackRelease("16n", time);
    rig.snareBody.triggerAttackRelease("G2", "16n", time);
  }, snareEvents);

  const hihatPart = new Tone.Part((time) => {
    rig.hihat.triggerAttackRelease("32n", time);
  }, hihatEvents);

  [bassPart, kickPart, snarePart, hihatPart].forEach((p) => {
    p.start(0);
    bassParts.push(p);
  });

  // UI highlight: one chord per bar, via setTimeout (decoupled from rAF/Tone.Draw
  // so the highlight is reliable). count-in = one bar (4 beats).
  const beatMs = (60 / bpm) * 1000;
  const barMs = 4 * beatMs;
  const countInMs = barMs;
  roots.forEach((_, ci) => {
    bassUiTimers.push(
      setTimeout(() => cb.onStep?.(ci), countInMs + ci * barMs)
    );
  });
  const endMs = countInMs + numChords * barMs;
  bassUiTimers.push(
    setTimeout(() => {
      cb.onEnd?.();
      stopBassGroove();
    }, endMs)
  );

  transport.start();
}
