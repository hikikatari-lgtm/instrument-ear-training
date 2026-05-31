"use client";

import QuizRunner from "@/components/QuizRunner";
import PianoStimulus from "@/components/PianoStimulus";
import { pianoQuestions } from "@/lib/questions";

export default function PianoPage() {
  return (
    <QuizRunner
      instrument="piano"
      title="Piano"
      icon="🎹"
      questions={pianoQuestions}
      renderStimulus={(q, answered) =>
        q.chord ? <PianoStimulus chord={q.chord} answered={answered} /> : null
      }
    />
  );
}
