"use client";

import QuizRunner from "@/components/QuizRunner";
import BassLine from "@/components/BassLine";
import { bassQuestions, EarQuestion } from "@/lib/questions";
import { playBassLine } from "@/lib/audio";

export default function BassPage() {
  return (
    <QuizRunner
      instrument="bass"
      title="Bass"
      icon="🎸"
      questions={bassQuestions}
      onPlay={(q: EarQuestion) => {
        if (q.bassNotes) playBassLine(q.bassNotes, 90);
      }}
      renderVisual={(q) =>
        q.bassNotes ? (
          <BassLine notes={q.bassNotes} musicKey={q.bassKey} />
        ) : null
      }
    />
  );
}
