import React from "react";
import { Sparkles } from "lucide-react";

export default function Header() {
  return (
    <header className="h-14 border-b border-[#2f2f2f]/40 bg-[#212121]/90 backdrop-blur-md flex items-center justify-between px-6 z-10 shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
          <Sparkles className="w-4 h-4 text-zinc-300" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-zinc-100">
              NextAI GPT-Engine
            </h2>
            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700 font-mono">
              local-streaming
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
