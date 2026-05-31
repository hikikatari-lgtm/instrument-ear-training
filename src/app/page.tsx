"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  pianoQuestions,
  guitarQuestions,
  bassQuestions,
} from "@/lib/questions";
import {
  Instrument,
  ProgressStatus,
  loadProgress,
  statusOf,
} from "@/lib/progress";

interface Card {
  href: string;
  instrument: Instrument;
  icon: string;
  title: string;
  subtitle: string;
  total: number;
}

const CARDS: Card[] = [
  {
    href: "/piano",
    instrument: "piano",
    icon: "🎹",
    title: "Piano",
    subtitle: "コードを聴いて当てる",
    total: pianoQuestions.length,
  },
  {
    href: "/guitar",
    instrument: "guitar",
    icon: "🎸",
    title: "Guitar",
    subtitle: "コードフォームを聴いて当てる",
    total: guitarQuestions.length,
  },
  {
    href: "/bass",
    instrument: "bass",
    icon: "🎸",
    title: "Bass",
    subtitle: "ベースラインからコード進行を当てる",
    total: bassQuestions.length,
  },
];

const BADGE_STYLE: Record<ProgressStatus, string> = {
  未着手: "border-zinc-700 text-zinc-400",
  進行中: "border-blue-400/50 text-blue-300",
  完了: "border-gold/60 text-gold",
};

export default function Home() {
  const [statuses, setStatuses] = useState<
    Record<Instrument, { status: ProgressStatus; best: number; total: number }>
  >({
    piano: { status: "未着手", best: 0, total: pianoQuestions.length },
    guitar: { status: "未着手", best: 0, total: guitarQuestions.length },
    bass: { status: "未着手", best: 0, total: bassQuestions.length },
  });

  useEffect(() => {
    const next = {} as typeof statuses;
    for (const card of CARDS) {
      const p = loadProgress(card.instrument, card.total);
      next[card.instrument] = {
        status: statusOf(p),
        best: p.bestScore,
        total: card.total,
      };
    }
    setStatuses(next);
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-gold sm:text-4xl">
          Instrument Ear Training
        </h1>
        <p className="mt-3 text-zinc-400">楽器の音を聴いて、理論力を鍛える</p>
      </header>

      <section className="mt-10 grid gap-5">
        {CARDS.map((card) => {
          const s = statuses[card.instrument];
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group flex items-center gap-4 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 transition hover:border-gold/50 hover:bg-zinc-900/70"
            >
              <div className="text-4xl">{card.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold transition group-hover:text-gold">
                    {card.title}
                  </h2>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                      BADGE_STYLE[s.status]
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-400">{card.subtitle}</p>
                <p className="mt-1 text-xs text-zinc-500">
                  全{card.total}問
                  {s.best > 0 && ` ・ ベスト ${s.best}/${s.total}`}
                </p>
              </div>
              <div className="text-zinc-600 transition group-hover:text-gold">
                →
              </div>
            </Link>
          );
        })}
      </section>

      <footer className="mt-12 text-center text-xs text-zinc-600">
        🎹 Piano ・ 🎸 Guitar ・ 🎸 Bass — 3択クイズで理論を学ぶ
      </footer>
    </main>
  );
}
