"use client";

import { useEffect, useRef, useState } from "react";
import Piano from "./Piano";
import PlayButton from "./PlayButton";
import { playPianoChord, stopPiano } from "@/lib/audio";
import { chordHighlightSplit } from "@/lib/music";

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

  // root (left hand, red) + upper tones (right hand, gold), shown while it
  // rings or once answered
  const show = isPlaying || answered;
  const { rootPc, upperPcs } = chordHighlightSplit(chord);

  return (
    <div className="mt-5 flex flex-col items-center">
      <PlayButton isPlaying={isPlaying} onClick={handleToggle} />
      <div className="mt-6 w-full overflow-x-auto">
        <Piano
          highlight={show ? upperPcs : []}
          rootHighlight={show ? [rootPc] : []}
        />
      </div>
      {show && (
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-[#e0533d]" />
            左手ルート
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm bg-gold" />
            右手コードトーン
          </span>
        </div>
      )}
      {answered && (
        <p className="mt-2 text-lg font-bold text-gold">{chord}</p>
      )}
    </div>
  );
}
