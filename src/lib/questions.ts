import { chordNoteNames, parseChord, ChordQuality } from "./music";

export interface GuitarChordShape {
  name: string;
  // frets from 6th string (low E) to 1st string (high E)
  frets: (number | "x")[];
  strings: number; // root / bass string number
}

export interface EarQuestion {
  id: string;
  instrument: "piano" | "guitar" | "bass";
  question: string;
  chord?: string; // piano: chord symbol to play
  guitarChord?: GuitarChordShape; // guitar: shape to play
  bassNotes?: string[]; // bass: root notes to play
  bassKey?: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

// ---- Piano -----------------------------------------------------------------

const QUALITY_TEXT: Record<ChordQuality, string> = {
  major: "明るい響き。長3度+短3度の構成。",
  minor: "暗い響き。短3度+長3度の構成。",
  dom7: "ブルージーな響き。長三和音+短7度。",
  maj7: "おしゃれな響き。長三和音+長7度。",
  min7: "柔らかく暗い響き。短三和音+短7度。",
};

function pianoExplain(label: string, chord: string): string {
  const { quality } = parseChord(chord);
  const notes = chordNoteNames(chord).join("・");
  return `正解は ${label}（${notes}）。${QUALITY_TEXT[quality]}`;
}

interface PianoSpec {
  chord: string; // canonical symbol to play
  label: string; // display label of the correct choice
  choices: string[];
}

const PIANO_SPECS: PianoSpec[] = [
  { chord: "C", label: "C major", choices: ["C major", "C minor", "C7"] },
  { chord: "Am", label: "A minor", choices: ["A minor", "A major", "Am7"] },
  { chord: "G7", label: "G7", choices: ["G7", "GM7", "Gm7"] },
  { chord: "FM7", label: "FM7", choices: ["FM7", "F7", "Fm7"] },
  { chord: "Dm", label: "D minor", choices: ["D minor", "D major", "Dm7"] },
  { chord: "Em7", label: "Em7", choices: ["Em7", "EM7", "E7"] },
  { chord: "BbM7", label: "BbM7", choices: ["BbM7", "Bb7", "Bbm7"] },
  { chord: "Cm", label: "C minor", choices: ["C minor", "C major", "Cm7"] },
  { chord: "A7", label: "A7", choices: ["A7", "AM7", "Am7"] },
  { chord: "Eb", label: "Eb major", choices: ["Eb major", "Eb minor", "Eb7"] },
  { chord: "Dm7", label: "Dm7", choices: ["Dm7", "DM7", "D7"] },
  { chord: "GM7", label: "GM7", choices: ["GM7", "G7", "Gm7"] },
  { chord: "F", label: "F major", choices: ["F major", "F minor", "F7"] },
  { chord: "Cm7", label: "Cm7", choices: ["Cm7", "CM7", "C7"] },
  { chord: "E", label: "E major", choices: ["E major", "E minor", "E7"] },
  { chord: "AbM7", label: "AbM7", choices: ["AbM7", "Ab7", "Abm7"] },
  { chord: "Bm", label: "B minor", choices: ["B minor", "B major", "Bm7"] },
  { chord: "D7", label: "D7", choices: ["D7", "DM7", "Dm7"] },
  { chord: "Gb", label: "Gb major", choices: ["Gb major", "Gb minor", "Gb7"] },
  { chord: "Am7", label: "Am7", choices: ["Am7", "AM7", "A7"] },
];

export const pianoQuestions: EarQuestion[] = PIANO_SPECS.map((spec, i) => ({
  id: `piano-${i + 1}`,
  instrument: "piano",
  question: "このコードは何？",
  chord: spec.chord,
  choices: spec.choices,
  correctIndex: 0,
  explanation: pianoExplain(spec.label, spec.chord),
}));

// ---- Guitar ----------------------------------------------------------------

interface GuitarSpec {
  shape: GuitarChordShape;
  choices: string[];
  explanation: string;
}

const GUITAR_SPECS: GuitarSpec[] = [
  // 6-string root
  {
    shape: { name: "E", frets: [0, 2, 2, 1, 0, 0], strings: 6 },
    choices: ["E major", "E minor", "E7"],
    explanation: "6弦ルートの開放Eメジャー。明るい響き（E・G#・B）。",
  },
  {
    shape: { name: "Em", frets: [0, 2, 2, 0, 0, 0], strings: 6 },
    choices: ["E minor", "E major", "Em7"],
    explanation: "6弦ルートの開放Eマイナー。暗い響き（E・G・B）。",
  },
  {
    shape: { name: "F", frets: [1, 3, 3, 2, 1, 1], strings: 6 },
    choices: ["F major", "Fm", "F7"],
    explanation: "1フレットのバレーコードFメジャー（F・A・C）。Eメジャーフォームの平行移動。",
  },
  {
    shape: { name: "G", frets: [3, 5, 5, 4, 3, 3], strings: 6 },
    choices: ["G major", "Gm", "G7"],
    explanation: "3フレットのバレーコードGメジャー（G・B・D）。Eフォーム。",
  },
  {
    shape: { name: "A", frets: [5, 7, 7, 6, 5, 5], strings: 6 },
    choices: ["A major", "Am", "A7"],
    explanation: "5フレットのバレーコードAメジャー（A・C#・E）。Eフォーム。",
  },
  {
    shape: { name: "Fm", frets: [1, 3, 3, 1, 1, 1], strings: 6 },
    choices: ["F minor", "F major", "Fm7"],
    explanation: "1フレットのバレーコードFマイナー（F・Ab・C）。Emフォーム。",
  },
  {
    shape: { name: "F7", frets: [1, 3, 1, 2, 1, 1], strings: 6 },
    choices: ["F7", "FM7", "Fm7"],
    explanation: "F7（F・A・C・Eb）。ブルージーなドミナント7th。E7フォーム。",
  },
  {
    shape: { name: "GM7", frets: [3, 5, 4, 4, 3, 3], strings: 6 },
    choices: ["GM7", "G7", "Gm7"],
    explanation: "GM7（G・B・D・F#）。おしゃれな響き。Emaj7フォームの平行移動。",
  },
  // 5-string root
  {
    shape: { name: "Am", frets: ["x", 0, 2, 2, 1, 0], strings: 5 },
    choices: ["A minor", "A major", "Am7"],
    explanation: "5弦ルートの開放Aマイナー（A・C・E）。暗い響き。",
  },
  {
    shape: { name: "A", frets: ["x", 0, 2, 2, 2, 0], strings: 5 },
    choices: ["A major", "A minor", "A7"],
    explanation: "5弦ルートの開放Aメジャー（A・C#・E）。明るい響き。",
  },
  {
    shape: { name: "Bb", frets: ["x", 1, 3, 3, 3, 1], strings: 5 },
    choices: ["Bb major", "Bbm", "Bb7"],
    explanation: "1フレットのバレーコードBbメジャー（Bb・D・F）。Aフォーム。",
  },
  {
    shape: { name: "C", frets: ["x", 3, 5, 5, 5, 3], strings: 5 },
    choices: ["C major", "Cm", "C7"],
    explanation: "3フレットのバレーコードCメジャー（C・E・G）。Aフォーム。",
  },
  {
    shape: { name: "D", frets: ["x", 5, 7, 7, 7, 5], strings: 5 },
    choices: ["D major", "Dm", "D7"],
    explanation: "5フレットのバレーコードDメジャー（D・F#・A）。Aフォーム。",
  },
  {
    shape: { name: "Bbm", frets: ["x", 1, 3, 3, 2, 1], strings: 5 },
    choices: ["Bb minor", "Bb major", "Bbm7"],
    explanation: "1フレットのバレーコードBbマイナー（Bb・Db・F）。Amフォーム。",
  },
  {
    shape: { name: "Bb7", frets: ["x", 1, 3, 1, 3, 1], strings: 5 },
    choices: ["Bb7", "BbM7", "Bbm7"],
    explanation: "Bb7（Bb・D・F・Ab）。A7フォームのバレー。ブルージーな響き。",
  },
  {
    shape: { name: "CM7", frets: ["x", 3, 5, 4, 5, 3], strings: 5 },
    choices: ["CM7", "C7", "Cm7"],
    explanation: "CM7（C・E・G・B）。おしゃれな響き。Amaj7フォーム。",
  },
  // slash chords
  {
    shape: { name: "C/E", frets: [0, 3, 2, 0, 1, 0], strings: 6 },
    choices: ["C/E", "Am/E", "Em"],
    explanation: "C/E（コードはC、ベースがE）。Cの第1転回形。ベース音に注目。",
  },
  {
    shape: { name: "G/B", frets: ["x", 2, 0, 0, 0, 3], strings: 5 },
    choices: ["G/B", "Em/B", "Bm"],
    explanation: "G/B（コードはG、ベースがB）。Gの第1転回形。ベースラインの経過音によく使う。",
  },
  {
    shape: { name: "Am/G", frets: [3, 0, 2, 2, 1, 0], strings: 6 },
    choices: ["Am/G", "C/G", "G"],
    explanation: "Am/G（コードはAm、ベースがG）。下行ベースライン A→G を作る分数コード。",
  },
  {
    shape: { name: "D/F#", frets: [2, 0, 0, 2, 3, 2], strings: 6 },
    choices: ["D/F#", "Bm/F#", "F#m"],
    explanation: "D/F#（コードはD、ベースがF#）。Dの第1転回形。ベース上行に便利。",
  },
];

export const guitarQuestions: EarQuestion[] = GUITAR_SPECS.map((spec, i) => ({
  id: `guitar-${i + 1}`,
  instrument: "guitar",
  question: "このコードフォームは何？",
  guitarChord: spec.shape,
  choices: spec.choices,
  correctIndex: 0,
  explanation: spec.explanation,
}));

// ---- Bass ------------------------------------------------------------------

interface BassSpec {
  notes: string[];
  key: string;
  choices: string[];
  correctIndex: number;
  explanation: string;
}

const BASS_SPECS: BassSpec[] = [
  {
    notes: ["C2", "G2", "A2", "F2"],
    key: "C",
    choices: ["I-V-VIm-IV", "I-IV-VIm-V", "I-V-IIm-IV"],
    correctIndex: 0,
    explanation: "Key=C。C-G-Am-F は I-V-VIm-IV。王道の4コード進行。",
  },
  {
    notes: ["A2", "F2", "C2", "G2"],
    key: "C",
    choices: ["VIm-IV-I-V", "IIm-IV-I-V", "VIm-V-I-IV"],
    correctIndex: 0,
    explanation: "Key=C。Am-F-C-G は VIm-IV-I-V。VImから始まる王道進行。",
  },
  {
    notes: ["C2", "A2", "D2", "G2"],
    key: "C",
    choices: ["I-VIm-IIm-V", "I-IIIm-IVm-V", "I-VIm-IV-V"],
    correctIndex: 0,
    explanation: "Key=C。C-Am-Dm-G は I-VIm-IIm-V。循環コード（1625）。",
  },
  {
    notes: ["G2", "D2", "E2", "C2"],
    key: "G",
    choices: ["I-V-VIm-IV", "I-IV-VIm-V", "I-V-IIm-IV"],
    correctIndex: 0,
    explanation: "Key=G。G-D-Em-C は I-V-VIm-IV。Cのときと同じ機能。",
  },
  {
    notes: ["D2", "A2", "B2", "G2"],
    key: "D",
    choices: ["I-V-VIm-IV", "I-IV-IIm-V", "I-V-IIIm-IV"],
    correctIndex: 0,
    explanation: "Key=D。D-A-Bm-G は I-V-VIm-IV。キーが変わっても度数は同じ。",
  },
  {
    notes: ["F2", "C2", "D2", "Bb2"],
    key: "F",
    choices: ["I-V-VIm-IV", "I-V-IIm-IV", "I-IV-VIm-V"],
    correctIndex: 0,
    explanation: "Key=F。F-C-Dm-Bb は I-V-VIm-IV。",
  },
  {
    notes: ["A2", "E2", "F#2", "D2"],
    key: "A",
    choices: ["I-V-VIm-IV", "I-IV-VIm-V", "I-V-IIm-IV"],
    correctIndex: 0,
    explanation: "Key=A。A-E-F#m-D は I-V-VIm-IV。",
  },
  {
    notes: ["E2", "B2", "C#2", "A2"],
    key: "E",
    choices: ["I-V-VIm-IV", "I-IV-VIm-V", "I-V-IIIm-IV"],
    correctIndex: 0,
    explanation: "Key=E。E-B-C#m-A は I-V-VIm-IV。",
  },
  {
    notes: ["C2", "F2", "G2", "C3"],
    key: "C",
    choices: ["I-IV-V-I", "I-V-IV-I", "I-IIm-V-I"],
    correctIndex: 0,
    explanation: "Key=C。C-F-G-C は I-IV-V-I。最も基本的なスリーコード。",
  },
  {
    notes: ["A2", "D2", "E2", "A2"],
    key: "Am",
    choices: ["Im-IVm-V-Im", "Im-V-IV-Im", "Im-IIm-V-Im"],
    correctIndex: 0,
    explanation: "Key=Am。Am-Dm-E-Am は Im-IVm-V-Im。マイナーキーのスリーコード（Vは長三和音）。",
  },
  {
    notes: ["G2", "C2", "D2", "G2"],
    key: "G",
    choices: ["I-IV-V-I", "I-V-IV-I", "I-IIm-V-I"],
    correctIndex: 0,
    explanation: "Key=G。G-C-D-G は I-IV-V-I。",
  },
  {
    notes: ["D2", "G2", "C2", "A2"],
    key: "C",
    choices: ["IIm-V-I-VIm", "IV-V-I-IIm", "IIm-V-I-IIIm"],
    correctIndex: 0,
    explanation: "Key=C。Dm-G-C-Am は IIm-V-I-VIm。ツーファイブ（IIm-V）からの解決。",
  },
  {
    notes: ["C2", "E2", "A2", "G2"],
    key: "C",
    choices: ["I-IIIm-VIm-V", "I-III-VIm-V", "I-V7/VI-VIm-V"],
    correctIndex: 1,
    explanation:
      "Key=C。C-E-Am-G は I-III-VIm-V。IIIの E はメジャー（セカンダリードミナント V/VIm）で VIm へ強く解決する。",
  },
  {
    notes: ["F2", "G2", "A2"],
    key: "C / Am",
    choices: ["IV-V-VIm", "I-II-IIIm", "bVI-bVII-Im"],
    correctIndex: 0,
    explanation:
      "F-G-Am。Key=C なら IV-V-VIm（偽終止ふう）。Key=Am と捉えれば bVI-bVII-Im とも解釈できる。",
  },
  {
    notes: ["C2", "Bb2", "F2", "G2"],
    key: "C",
    choices: ["I-bVII-IV-V", "I-VII-IV-V", "I-V-IV-V"],
    correctIndex: 0,
    explanation: "Key=C。C-Bb-F-G は I-bVII-IV-V。bVII（Bb）はミクソリディアン的な響き。",
  },
  {
    notes: ["A2", "G2", "F2", "E2"],
    key: "Am",
    choices: ["Im-bVII-bVI-V", "Im-VII-VI-V", "Im-V-IV-III"],
    correctIndex: 0,
    explanation:
      "Key=Am。Am-G-F-E は Im-bVII-bVI-V。下行する「アンダルシア終止」。Vは長三和音。",
  },
  {
    notes: ["C3", "B2", "A2", "G2"],
    key: "C",
    choices: ["I-V/VII-VIm-V", "I-VII-VIm-V", "I-V-VIm-V"],
    correctIndex: 0,
    explanation:
      "Key=C。ベースが C-B-A-G と下行。C-G/B-Am-G は I-V/VII-VIm-V。G/B は V の第1転回形。",
  },
  {
    notes: ["D2", "G2", "C2", "F2"],
    key: "C",
    choices: ["IIm-V-I-IV", "IVm-V-I-IV", "IIm-V-I-V"],
    correctIndex: 0,
    explanation: "Key=C。Dm-G-C-F は IIm-V-I-IV。ツーファイブ・ワンからIVへ。",
  },
  {
    notes: ["E2", "A2", "D2", "G2"],
    key: "C",
    choices: ["IIIm-VIm-IIm-V", "VIm-IIm-V-I", "IIIm-VIm-IIm-IV"],
    correctIndex: 0,
    explanation:
      "Key=C。Em-Am-Dm-G は IIIm-VIm-IIm-V。4度ずつ進む「サークル・オブ・フィフス」進行。",
  },
  {
    notes: ["A2", "D2", "E2", "A2"],
    key: "A",
    choices: ["I-IV-V-I", "I-V-IV-I", "I-IIm-V-I"],
    correctIndex: 0,
    explanation: "Key=A。A-D-E-A は I-IV-V-I。スリーコード。",
  },
];

export const bassQuestions: EarQuestion[] = BASS_SPECS.map((spec, i) => ({
  id: `bass-${i + 1}`,
  instrument: "bass",
  question: "このベースラインが示すコード進行は？",
  bassNotes: spec.notes,
  bassKey: spec.key,
  choices: spec.choices,
  correctIndex: spec.correctIndex,
  explanation: spec.explanation,
}));

export const questionsByInstrument = {
  piano: pianoQuestions,
  guitar: guitarQuestions,
  bass: bassQuestions,
};
