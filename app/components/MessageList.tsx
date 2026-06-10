// client/app/components/MessageList.tsx
"use client";
import React from "react";
import { Sparkles, Plus, AlertCircle } from "lucide-react";
import MessageItem from "./MessageItem";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  error?: boolean;
}

interface MessageListProps {
  messages: Message[];
  error: string | null;
  setError: (err: string | null) => void;
  setUseMock: (useMock: boolean) => void;
  handleSendMessage: (prompt: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

const samplePrompts = [
  {
    title: "Create React Table",
    desc: "with responsive tailwind configurations",
    prompt: "Write a high performance reusable React table layout styled with Tailwind CSS, utilizing flex values.",
  },
  {
    title: "Next.js Streaming Guide",
    desc: "explaining server event protocol details",
    prompt: "Draft a comprehensive README.md summarizing server sent event properties of text/event-stream headers in modern Node environments.",
  },
  {
    title: "Debug SSE Handler",
    desc: "solving multi-segment buffer split issues",
    prompt: "Explain how buffer segmentation problems are resolved when parsing multiple JSON lines without manual separators.",
  },
];

export default function MessageList({
  messages,
  error,
  setError,
  setUseMock,
  handleSendMessage,
  messagesEndRef,
}: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-0 py-8 space-y-8 select-text">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Welcome Section */}
        {messages.length === 1 && (
          <div className="pt-8 pb-4 space-y-8 select-none">
            <div className="flex flex-col items-center text-center gap-2.5">
              <div className="w-12 h-12 rounded-full bg-zinc-850 flex items-center justify-center border border-zinc-800 shadow-md">
                <Sparkles className="w-5.5 h-5.5 text-zinc-300 animate-pulse" />
              </div>
              <h3 className="text-xl font-medium text-white tracking-tight">
                How can I help you today?
              </h3>
              <p className="text-xs text-zinc-400 font-light max-w-sm">
                Test and capture micro JSON fragments streaming dynamically into your local environment database system.
              </p>
            </div>

            {/* Prompt Chips */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {samplePrompts.map((chip, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(chip.prompt)}
                  className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/30 text-left hover:bg-zinc-800/40 hover:border-zinc-700 transition-all duration-200 group flex flex-col justify-between h-[100px] hover:scale-[1.01]"
                >
                  <div>
                    <span className="text-xs font-semibold text-zinc-200 block truncate">
                      {chip.title}
                    </span>
                    <span className="text-[10px] text-zinc-400 block mt-1 leading-snug line-clamp-2 font-light">
                      {chip.desc}
                    </span>
                  </div>
                  <span className="self-end text-zinc-500 group-hover:text-zinc-300 transition-all">
                    <Plus className="w-4.5 h-4.5" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message Bubble Thread */}
        {messages.map((msg) => (
          <MessageItem key={msg.id} msg={msg} />
        ))}

        {/* Error Dialog Box */}
        {error && (
          <div className="bg-red-950/20 border border-red-900/50 text-red-200 p-4 rounded-xl flex gap-3 items-start my-4">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm flex-1 space-y-2">
              <p className="font-semibold text-red-300">
                Connection Failed: Fetching context failed
              </p>
              <p className="opacity-90 text-[12.5px] leading-relaxed text-zinc-300 font-light">
                Standard browser environments prevent cross-protocol calls (from this secure dashboard to insecure local routes like{" "}
                <code className="bg-[#171717] px-1 py-0.5 rounded text-white text-[11px] font-mono">
                  http://localhost:3000
                </code>).
              </p>
              <div className="p-3 bg-zinc-950/40 rounded-lg text-[11.5px] font-mono text-zinc-400 space-y-1 border border-zinc-850">
                <span className="text-zinc-200 block font-semibold mb-1">
                  To Resolve Direct Connection:
                </span>
                <div>1. Switch Sidebar Target Mode to <strong className="text-zinc-100">Sandbox</strong> to run and review simulation streams inside this canvas frame.</div>
                <div>2. Copy and export this completed component to your own Next.js project on local port localhost.</div>
                <div>3. Assure your local Express controller includes standard CORS headers configuration parameters.</div>
              </div>
              <div className="flex gap-2 pt-1 select-none">
                <button
                  onClick={() => {
                    setError(null);
                    setUseMock(true);
                  }}
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
                >
                  Toggle Sandbox Demo
                </button>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
