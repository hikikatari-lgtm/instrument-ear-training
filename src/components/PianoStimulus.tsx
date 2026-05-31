"use client";

import { useEffect, useRef, useState } from "react";
import Piano from "./Piano";
import PlayButton from "./PlayButton";
import { playPianoChord, stopPiano } from "@/lib/audio";
import { chordPitchClasses } from "@/lib/music";

interface PianoStimulusProps {
  chord: string;
  answered: boolean;
}

export default function PianoStimulus({ chord, answered }: PianoStimulusProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      stopPiano();
    };
  }, []);

  const handleToggle = () => {
    if (isPlaying) {
      if (timer.current) clearTimeout(timer.current);
      stopPiano();
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    playPianoChord(chord);
    timer.current = setTimeout(() => setIsPlaying(false), 2300);
  };

  // highlight the chord tones while it rings, or once answered
  const highlight = isPlaying || answered ? chordPitchClasses(chord) : [];

  return (
    <div className="mt-5 flex flex-col items-center">
      <PlayButton isPlaying={isPlaying} onClick={handleToggle} />
      <div className="mt-6 w-full overflow-x-auto">
        <Piano highlight={highlight} />
      </div>
      {answered && (
        <p className="mt-3 text-lg font-bold text-gold">{chord}</p>
      )}
    </div>
  );
}
