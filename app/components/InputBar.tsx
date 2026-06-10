// client/app/components/InputBar.tsx
"use client";
import React, { useState } from "react";
import { Compass, ArrowUp } from "lucide-react";

interface InputBarProps {
  isLoading: boolean;
  useMock: boolean;
  onSend: (text: string) => void;
}

export default function InputBar({ isLoading, useMock, onSend }: InputBarProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input);
      setInput("");
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gradient-to-t from-[#212121] via-[#212121] to-transparent shrink-0 z-10 select-none">
      <div className="max-w-2xl mx-auto">
        {/* Floating controls indicator bar */}
        <div className="flex items-center justify-between mb-2 px-1 text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-zinc-600" />
            <span>
              Mode:{" "}
              {useMock
                ? "Sandbox Standalone Simulator"
                : "Direct API Bridge"}
            </span>
          </div>
          {useMock && (
            <span className="text-zinc-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full inline-block animate-pulse" />
              Standalone Simulation Active
            </span>
          )}
        </div>

        {/* Main capsule-shaped inputs border panel */}
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center bg-[#2f2f2f] border border-zinc-800 focus-within:border-zinc-700 rounded-2xl shadow-xl transition-all p-1.5"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              useMock
                ? "Send simulation prompt..."
                : "Ask your active local generator API..."
            }
            className="w-full bg-transparent px-4 py-3 text-[14px] text-zinc-200 placeholder-zinc-500 outline-none pr-14 font-light"
            disabled={isLoading}
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-3 p-2 rounded-xl bg-white text-black hover:opacity-90 disabled:opacity-10 disabled:bg-zinc-800 disabled:text-zinc-500 transition-all shadow cursor-pointer flex items-center justify-center active:scale-95"
          >
            <ArrowUp className="w-4 h-4 font-bold" />
          </button>
        </form>

        <p className="text-[10px] text-zinc-500 text-center mt-3">
          Parsed payloads correspond with SSE structure definitions.
          Stream parses dynamic keys automatically.
        </p>
      </div>
    </div>
  );
}
