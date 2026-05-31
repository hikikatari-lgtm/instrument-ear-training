"use client";

import { useState } from "react";
import Link from "next/link";
import { EarQuestion } from "@/lib/questions";
import { Instrument, loadProgress, saveProgress } from "@/lib/progress";

interface QuizRunnerProps {
  instrument: Instrument;
  title: string;
  icon: string;
  questions: EarQuestion[];
  // Renders the play/stop control + live visual for a question. It is
  // remounted on every question change (key on index), so it can own its
  // playback + highlight state and stop audio on unmount.
  renderStimulus: (q: EarQuestion, answered: boolean) => React.ReactNode;
}

export default function QuizRunner({
  instrument,
  title,
  icon,
  questions,
  renderStimulus,
}: QuizRunnerProps) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [results, setResults] = useState<boolean[]>([]);

  const q = questions[index];

  const handleAnswer = (i: number) => {
    if (answered) return;
    setSelected(i);
    setAnswered(true);
    const isCorrect = i === q.correctIndex;
    if (isCorrect) setCorrectCount((c) => c + 1);
    setResults((r) => {
      const next = [...r];
      next[index] = isCorrect;
      return next;
    });
  };

  const handleNext = () => {
    if (index + 1 >= questions.length) {
      const finalScore = correctCount;
      const prev = loadProgress(instrument, questions.length);
      saveProgress(instrument, {
        completed: finalScore,
        total: questions.length,
        finished: true,
        bestScore: Math.max(prev.bestScore, finalScore),
      });
      setFinished(true);
    } else {
      setIndex((n) => n + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  const handleRetry = () => {
    setIndex(0);
    setSelected(null);
    setAnswered(false);
    setCorrectCount(0);
    setFinished(false);
    setResults([]);
  };

  if (finished) {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="animate-fade-in rounded-2xl border border-gold/30 bg-zinc-900/50 p-8 text-center">
          <div className="text-5xl">{icon}</div>
          <h1 className="mt-4 text-2xl font-bold text-gold">結果</h1>
          <p className="mt-6 text-5xl font-bold">
            {correctCount}
            <span className="text-2xl text-zinc-400"> / {questions.length}</span>
          </p>
          <p className="mt-2 text-zinc-400">正答率 {pct}%</p>

          <div className="mt-8 grid grid-cols-5 gap-2 sm:grid-cols-10">
            {results.map((ok, i) => (
              <div
                key={i}
                className={`flex h-9 items-center justify-center rounded text-sm font-bold ${
                  ok ? "bg-gold/20 text-gold" : "bg-red-500/15 text-red-400"
                }`}
                title={`Q${i + 1}`}
              >
                {ok ? "○" : "×"}
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={handleRetry}
              className="rounded-xl bg-gold px-6 py-3 font-bold text-black transition hover:brightness-110"
            >
              もう一度
            </button>
            <Link
              href="/"
              className="rounded-xl border border-zinc-700 px-6 py-3 font-bold text-zinc-200 transition hover:border-gold/50"
            >
              トップへ戻る
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const isCorrect = selected === q.correctIndex;

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/" className="text-sm text-zinc-400 transition hover:text-gold">
          ← トップ
        </Link>
        <span className="text-sm text-zinc-400">
          {icon} {title}
        </span>
        <span className="text-sm font-bold text-gold">
          {index + 1} / {questions.length}
        </span>
      </div>

      {/* progress bar */}
      <div className="mb-6 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-gold transition-all"
          style={{ width: `${(index / questions.length) * 100}%` }}
        />
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 sm:p-6">
        <h2 className="text-center text-lg font-bold">{q.question}</h2>

        {/* play control + live visual (remounted per question) */}
        <div key={`stim-${index}`}>{renderStimulus(q, answered)}</div>

        {/* choices */}
        <div className="mt-6 grid gap-3">
          {q.choices.map((choice, i) => {
            let cls =
              "border-zinc-700 bg-zinc-800/50 hover:border-gold/60 hover:bg-zinc-800";
            if (answered) {
              if (i === q.correctIndex) {
                cls = "border-gold bg-gold/20 text-gold";
              } else if (i === selected) {
                cls = "border-red-500/60 bg-red-500/15 text-red-300";
              } else {
                cls = "border-zinc-800 bg-zinc-900/40 text-zinc-500";
              }
            }
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={answered}
                className={`rounded-xl border px-4 py-3 text-left text-base font-medium transition ${cls}`}
              >
                {choice}
              </button>
            );
          })}
        </div>

        {/* explanation */}
        {answered && (
          <div className="animate-fade-in mt-5 rounded-xl border border-zinc-800 bg-black/40 p-4">
            <p className={`font-bold ${isCorrect ? "text-gold" : "text-red-400"}`}>
              {isCorrect ? "正解！" : "不正解"}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-300">
              {q.explanation}
            </p>
            <button
              onClick={handleNext}
              className="mt-4 w-full rounded-xl bg-gold px-6 py-3 font-bold text-black transition hover:brightness-110"
            >
              {index + 1 >= questions.length ? "結果を見る" : "次へ →"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
