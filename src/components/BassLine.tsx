"use client";

// Simple bass-line display: the key plus the sequence of root notes.
// Octave digits are stripped for readability (C2 -> C).

interface BassLineProps {
  notes: string[];
  musicKey?: string;
}

export default function BassLine({ notes, musicKey }: BassLineProps) {
  return (
    <div className="w-full">
      {musicKey && (
        <p className="mb-3 text-center text-sm text-zinc-400">
          Key: <span className="font-bold text-gold">{musicKey}</span>
        </p>
      )}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {notes.map((note, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-gold/40 bg-zinc-900 text-lg font-bold text-gold">
              {note.replace(/\d+$/, "")}
            </div>
            {i < notes.length - 1 && (
              <span className="text-zinc-600">→</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
