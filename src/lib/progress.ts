// Per-instrument progress persisted to localStorage.

export type Instrument = "piano" | "guitar" | "bass";
export type ProgressStatus = "未着手" | "進行中" | "完了";

interface InstrumentProgress {
  completed: number; // number of questions answered correctly at least once
  total: number;
  finished: boolean; // the user reached the results screen
  bestScore: number;
}

const KEY_PREFIX = "iet:progress:";

export function loadProgress(
  instrument: Instrument,
  total: number
): InstrumentProgress {
  if (typeof window === "undefined") {
    return { completed: 0, total, finished: false, bestScore: 0 };
  }
  try {
    const raw = window.localStorage.getItem(KEY_PREFIX + instrument);
    if (!raw) return { completed: 0, total, finished: false, bestScore: 0 };
    const parsed = JSON.parse(raw) as InstrumentProgress;
    return { ...parsed, total };
  } catch {
    return { completed: 0, total, finished: false, bestScore: 0 };
  }
}

export function saveProgress(
  instrument: Instrument,
  progress: InstrumentProgress
) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      KEY_PREFIX + instrument,
      JSON.stringify(progress)
    );
  } catch {
    // ignore quota / privacy mode errors
  }
}

export function statusOf(progress: InstrumentProgress): ProgressStatus {
  if (progress.finished || progress.bestScore >= progress.total) return "完了";
  if (progress.bestScore > 0 || progress.completed > 0) return "進行中";
  return "未着手";
}
