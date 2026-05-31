"use client";

import QuizRunner from "@/components/QuizRunner";
import Fretboard from "@/components/Fretboard";
import { guitarQuestions, EarQuestion } from "@/lib/questions";
import { playGuitarChord } from "@/lib/audio";

export default function GuitarPage() {
  return (
    <QuizRunner
      instrument="guitar"
      title="Guitar"
      icon="🎸"
      questions={guitarQuestions}
      onPlay={(q: EarQuestion) => {
        if (q.guitarChord) playGuitarChord(q.guitarChord.frets);
      }}
      renderVisual={(q, answered) =>
        q.guitarChord ? (
          <Fretboard frets={q.guitarChord.frets} reveal={answered} />
        ) : null
      }
    />
  );
}
