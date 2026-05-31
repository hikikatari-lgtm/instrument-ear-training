"use client";

import QuizRunner from "@/components/QuizRunner";
import BassStimulus from "@/components/BassStimulus";
import { bassQuestions } from "@/lib/questions";

export default function BassPage() {
  return (
    <QuizRunner
      instrument="bass"
      title="Bass"
      icon="🎸"
      questions={bassQuestions}
      renderStimulus={(q, answered) =>
        q.bassNotes ? (
          <BassStimulus
            notes={q.bassNotes}
            musicKey={q.bassKey}
            bpm={110}
            answered={answered}
          />
        ) : null
      }
    />
  );
}
