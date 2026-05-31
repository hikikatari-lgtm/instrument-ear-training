"use client";

import { useEffect, useRef, useState } from "react";
import ChordDiagram from "./ChordDiagram";
import PlayButton from "./PlayButton";
import { playGuitarChord, stopGuitar } from "@/lib/audio";
import { GuitarChordShape } from "@/lib/questions";

interface GuitarStimulusProps {
  shape: GuitarChordShape;
  answered: boolean;
}

export default function GuitarStimulus({ shape, answered }: GuitarStimulusProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
      stopGuitar();
    };
  }, []);

  const handleToggle = () => {
    if (isPlaying) {
      if (timer.current) clearTimeout(timer.current);
      stopGuitar();
      setIsPlaying(false);
      return;
    }
    setRevealed(true);
    setIsPlaying(true);
    playGuitarChord(shape.frets);
    timer.current = setTimeout(() => setIsPlaying(false), 2200);
  };

  const showDiagram = revealed || answered;

  return (
    <div className="mt-5 flex flex-col items-center">
      <PlayButton isPlaying={isPlaying} onClick={handleToggle} />
      <div className="mt-6 flex min-h-[200px] items-center justify-center">
        {showDiagram ? (
          <ChordDiagram
            frets={shape.frets}
            name={shape.name}
            showName={answered}
          />
        ) : (
          <p className="text-sm text-zinc-500">
            🔊 再生するとコードダイアグラムが表示されます
          </p>
        )}
      </div>
    </div>
  );
}
