"use client";

import QuizRunner from "@/components/QuizRunner";
import Piano from "@/components/Piano";
import { pianoQuestions, EarQuestion } from "@/lib/questions";
import { playPianoChord } from "@/lib/audio";
import { chordPitchClasses } from "@/lib/music";

export default function PianoPage() {
  return (
    <QuizRunner
      instrument="piano"
      title="Piano"
      icon="🎹"
      questions={pianoQuestions}
      onPlay={(q: EarQuestion) => {
        if (q.chord) playPianoChord(q.chord);
      }}
      renderVisual={(q, answered) => (
        <Piano
          highlight={answered && q.chord ? chordPitchClasses(q.chord) : []}
        />
      )}
    />
  );
}
