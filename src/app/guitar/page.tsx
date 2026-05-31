"use client";

import QuizRunner from "@/components/QuizRunner";
import GuitarStimulus from "@/components/GuitarStimulus";
import { guitarQuestions } from "@/lib/questions";

export default function GuitarPage() {
  return (
    <QuizRunner
      instrument="guitar"
      title="Guitar"
      icon="🎸"
      questions={guitarQuestions}
      renderStimulus={(q, answered) =>
        q.guitarChord ? (
          <GuitarStimulus shape={q.guitarChord} answered={answered} />
        ) : null
      }
    />
  );
}
