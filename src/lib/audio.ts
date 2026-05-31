// Tone.js audio engine. All functions are client-side only and lazily
// create synths after the first user gesture to satisfy autoplay policies.
import * as Tone from "tone";
import { chordVoicing, guitarChordNotes } from "./music";

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

export async function playPianoChord(symbol: string) {
  await ensureStarted();
  const notes = chordVoicing(symbol, 4);
  getPiano().triggerAttackRelease(notes, "2n");
}

export function stopPiano() {
  pianoSynth?.releaseAll();
}

// ---- Guitar ----------------------------------------------------------------

let guitarSynth: Tone.PluckSynth | null = null;
let guitarGain: Tone.Gain | null = null;

function getGuitar(): Tone.PluckSynth {
  if (!guitarSynth) {
    guitarGain = new Tone.Gain(1).toDestination();
    guitarSynth = new Tone.PluckSynth({
      attackNoise: 2,
      dampening: 4000,
      resonance: 0.9,
    }).connect(guitarGain);
    guitarSynth.volume.value = -2;
  }
  return guitarSynth;
}

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

export function stopGuitar() {
  if (!guitarGain) return;
  const now = Tone.now();
  guitarGain.gain.cancelScheduledValues(now);
  guitarGain.gain.setValueAtTime(0, now);
  // restore so the next strum is audible
  setTimeout(() => {
    if (guitarGain) guitarGain.gain.setValueAtTime(1, Tone.now());
  }, 140);
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

// Play a bass line in sync with a rock drum kit. A one-bar hi-hat count-in
// precedes the groove; `onStep` fires (UI-synced) as each bass root sounds.
export async function playBassGroove(
  notes: string[],
  bpm = 110,
  cb: BassGrooveCallbacks = {}
) {
  await ensureStarted();
  stopBassGroove();

  const rig = getBassRig();
  const transport = Tone.getTransport();
  transport.bpm.value = bpm;
  transport.position = 0;

  const mainBars = Math.ceil(notes.length / 4);

  // Bass: one root per quarter note, starting at bar 1 (after the count-in).
  const bassEvents = notes.map((pitch, i) => ({
    time: `1:${i % 4}:0`,
    bar: 1 + Math.floor(i / 4),
    pitch,
    index: i,
  }));
  // fix bar in time string (template above only used the beat within a bar)
  bassEvents.forEach((e) => {
    e.time = `${e.bar}:${e.index % 4}:0`;
  });

  const kickEvents: { time: string }[] = [];
  const snareEvents: { time: string }[] = [];
  const hihatEvents: { time: string }[] = [];

  // count-in: four hi-hats on bar 0 (チッチッチッチッ)
  for (let beat = 0; beat < 4; beat++) {
    hihatEvents.push({ time: `0:${beat}:0` });
  }
  // main groove
  for (let b = 0; b < mainBars; b++) {
    const bar = 1 + b;
    kickEvents.push({ time: `${bar}:0:0` }, { time: `${bar}:2:0` });
    snareEvents.push({ time: `${bar}:1:0` }, { time: `${bar}:3:0` });
    for (let beat = 0; beat < 4; beat++) {
      hihatEvents.push({ time: `${bar}:${beat}:0` }, { time: `${bar}:${beat}:2` });
    }
  }

  const bassPart = new Tone.Part((time, ev: (typeof bassEvents)[number]) => {
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

  // UI highlights: drive with setTimeout (decoupled from rAF/Tone.Draw so the
  // highlight is reliable). count-in = one bar (4 beats); then one root per beat.
  const beatMs = (60 / bpm) * 1000;
  const countInMs = 4 * beatMs;
  notes.forEach((_, i) => {
    bassUiTimers.push(
      setTimeout(() => cb.onStep?.(i), countInMs + i * beatMs)
    );
  });
  // end one beat after the last root sounds
  const endMs = countInMs + notes.length * beatMs;
  bassUiTimers.push(
    setTimeout(() => {
      cb.onEnd?.();
      stopBassGroove();
    }, endMs)
  );

  transport.start();
}
