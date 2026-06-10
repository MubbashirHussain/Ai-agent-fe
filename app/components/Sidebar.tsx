// client/app/components/Sidebar.tsx
"use client";
import React from "react";
import {
  Plus,
  Wifi,
  WifiOff,
  Trash2,
  Cpu,
  RefreshCw,
  Settings,
  HelpCircle,
  Compass,
  ArrowUp,
  Sliders,
} from "lucide-react";

interface SidebarProps {
  showSidebar: boolean;
  setShowSidebar: (v: boolean) => void;
  setShowConfig: (v: boolean) => void;
  useMock: boolean;
  setUseMock: (v: boolean) => void;
  apiUrl: string;
  setApiUrl: (v: string) => void;
  samplePrompts: { title: string; desc: string; prompt: string }[];
  handleSendMessage: (prompt: string) => void;
}

export default function Sidebar({
  showSidebar,
  setShowSidebar,
  setShowConfig,
  useMock,
  setUseMock,
  apiUrl,
  setApiUrl,
  samplePrompts,
  handleSendMessage,
}: SidebarProps) {
  return (
    <div
      className={`bg-[#171717] border-r border-[#2f2f2f] flex flex-col h-full shrink-0 transition-all duration-300 relative z-20 ${
        showSidebar
          ? "w-[260px] opacity-100"
          : "w-0 opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex flex-col h-full w-[260px]">
        {/* Sidebar Header */}
        <div className="p-3.5 flex items-center justify-between">
          <button
            onClick={() => setShowSidebar(false)}
            className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-100 hover:text-white transition-all text-xs font-semibold select-none"
          >
            <Plus className="w-4 h-4 text-zinc-400" />
            <span>Close</span>
          </button>
        </div>
        {/* Content simplified for brevity */}
        {/* Sample Prompts */}
        <div className="flex-1 px-3 overflow-y-auto space-y-1 py-2">
          {samplePrompts.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip.prompt)}
              className="p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
            >
              {chip.title}
            </button>
          ))}
        </div>
        {/* Footer */}
        <div className="p-3 border-t border-[#2f2f2f] bg-[#171717] flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <WifiOff className="w-3 h-3 text-zinc-600" />
            <span>{useMock ? "Sandbox" : "Live"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
