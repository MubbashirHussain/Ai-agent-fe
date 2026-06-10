// client/app/components/LogConsole.tsx
"use client";
import React from "react";
import { Terminal, Code } from "lucide-react";

interface LogItem {
  id: string;
  time: string;
  type: "info" | "raw_chunk" | "warn" | "success" | "error";
  content: string;
}

interface LogConsoleProps {
  rawLogs: LogItem[];
  setRawLogs: (logs: LogItem[]) => void;
}

export default function LogConsole({ rawLogs, setRawLogs }: LogConsoleProps) {
  return (
    <div className="w-96 bg-[#0d0d0d] border-l border-[#2f2f2f] flex flex-col h-full shrink-0 z-10 select-text">
      <div className="p-4 border-b border-[#2f2f2f] flex items-center justify-between bg-[#171717] select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-semibold text-zinc-300 tracking-wide uppercase">
            SSE Transaction Console
          </span>
        </div>
        <button
          onClick={() => setRawLogs([])}
          className="text-[10px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition-all cursor-pointer"
        >
          Clear logs
        </button>
      </div>

      {/* Logs loop view */}
      <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] space-y-2 select-all">
        {rawLogs.length === 0 ? (
          <div className="text-zinc-600 flex flex-col items-center justify-center h-full text-center gap-2 select-none">
            <Code className="w-7 h-7 opacity-30" />
            <p>No transactions registered yet.</p>
            <p className="text-[10px] max-w-[200px]">
              Send messages to monitor decoded raw strings here.
            </p>
          </div>
        ) : (
          rawLogs.map((log) => (
            <div
              key={log.id}
              className={`p-2 rounded border transition-all ${
                log.type === "error"
                  ? "bg-red-950/20 border-red-900/30 text-red-300"
                  : log.type === "warn"
                    ? "bg-amber-950/20 border-amber-900/30 text-amber-300"
                    : log.type === "success"
                      ? "bg-emerald-950/10 border-emerald-900/30 text-emerald-300"
                      : log.type === "raw_chunk"
                        ? "bg-[#171717] border-zinc-850 text-zinc-300"
                        : "bg-zinc-900 border-zinc-850 text-zinc-500"
              }`}
            >
              <div className="flex justify-between text-[9px] opacity-60 mb-1 select-none">
                <span>[{log.time}]</span>
                <span className="uppercase font-bold">{log.type}</span>
              </div>
              <p className="break-all whitespace-pre-wrap font-mono">
                {log.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
