"use client";

import { useEffect, useMemo, useState } from "react";
import BassFretboard from "./BassFretboard";
import PlayButton from "./PlayButton";
import { playBassGroove, stopBassGroove } from "@/lib/audio";
import { bassPosition } from "@/lib/music";

interface BassStimulusProps {
  notes: string[];
  musicKey?: string;
  bpm?: number;
  answered: boolean;
}

export default function BassStimulus({
  notes,
  musicKey,
  bpm = 110,
  answered,
}: BassStimulusProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const positions = useMemo(() => notes.map(bassPosition), [notes]);

  useEffect(() => {
    return () => {
      stopBassGroove();
    };
  }, []);

  const handleToggle = () => {
    if (isPlaying) {
      stopBassGroove();
      setIsPlaying(false);
      setActiveIndex(null);
      return;
    }
    setIsPlaying(true);
    setActiveIndex(null);
    playBassGroove(notes, bpm, {
      onStep: (i) => setActiveIndex(i),
      onEnd: () => {
        setIsPlaying(false);
        setActiveIndex(null);
      },
    });
  };

  return (
    <div className="mt-5 flex flex-col items-center">
      <PlayButton isPlaying={isPlaying} onClick={handleToggle} />
      {musicKey && (
        <p className="mt-3 text-sm text-zinc-400">
          Key: <span className="font-bold text-gold">{musicKey}</span>
          <span className="ml-3 text-zinc-500">🥁 ロックドラム付き ({bpm} BPM)</span>
        </p>
      )}
      <div className="mt-4 w-full overflow-x-auto">
        <BassFretboard positions={positions} activeIndex={activeIndex} />
      </div>
      {/* root sequence chips */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {positions.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg border text-base font-bold transition ${
                i === activeIndex
                  ? "border-gold bg-gold text-black"
                  : "border-zinc-700 bg-zinc-900 text-zinc-300"
              }`}
            >
              {p.label}
            </div>
            {i < positions.length - 1 && (
              <span className="text-zinc-600">→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
