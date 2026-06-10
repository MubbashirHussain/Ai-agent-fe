// client/app/components/Sidebar.tsx
"use client";
import React from "react";
import {
  Plus,
  Wifi,
  WifiOff,
  Cpu,
  Sliders,
  History,
  ChevronLeft,
} from "lucide-react";

interface SidebarProps {
  showSidebar: boolean;
  setShowSidebar: (v: boolean) => void;
  useMock: boolean;
  setUseMock: (v: boolean) => void;
  apiUrl: string;
  setApiUrl: (v: string) => void;
  clearChat: () => void;
  showConfig: boolean;
  setShowConfig: (v: boolean) => void;
  setError: (err: string | null) => void;
}

export default function Sidebar({
  showSidebar,
  setShowSidebar,
  useMock,
  setUseMock,
  apiUrl,
  setApiUrl,
  clearChat,
  showConfig,
  setShowConfig,
  setError,
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
            onClick={clearChat}
            className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border border-zinc-800 hover:bg-zinc-800 text-zinc-100 hover:text-white transition-all text-xs font-semibold select-none"
          >
            <Plus className="w-4 h-4 text-zinc-400" />
            <span>New chat</span>
          </button>

          <button
            onClick={() => setShowSidebar(false)}
            className="ml-1 p-2.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer"
            title="Close sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Active Navigation List */}
        <div className="flex-1 px-3 overflow-y-auto space-y-1 py-2">
          <span className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase px-3 mb-1.5 block">
            Environment Setup
          </span>

          <div className="bg-[#212121] border border-zinc-850 p-3 rounded-xl mb-4 space-y-2.5 mx-1">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-medium">
              <span>Select Target</span>
              <span
                className={`w-1.5 h-1.5 rounded-full ${useMock ? "bg-zinc-400" : "bg-emerald-400 animate-pulse"}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-1 bg-[#171717] p-0.5 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() => setUseMock(true)}
                className={`flex items-center justify-center gap-1 py-1.5 text-[11px] rounded font-semibold transition-all ${
                  useMock
                    ? "bg-zinc-800 text-white shadow-md"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <WifiOff className="w-3 h-3" />
                <span>Sandbox</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setUseMock(false);
                  setError(null);
                }}
                className={`flex items-center justify-center gap-1 py-1.5 text-[11px] rounded font-semibold transition-all ${
                  !useMock
                    ? "bg-zinc-800 text-white shadow-md"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Wifi className="w-3 h-3" />
                <span>Localhost</span>
              </button>
            </div>
          </div>

          {/* Target Endpoint Config */}
          <div className="bg-[#212121]/50 border border-zinc-850/60 rounded-xl p-3 space-y-2 mx-1">
            <span className="text-[10px] font-medium tracking-wide text-zinc-400 uppercase block">
              API endpoint
            </span>
            <input
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              disabled={useMock}
              className="w-full bg-[#171717] border border-zinc-800 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-zinc-300 outline-none focus:border-zinc-700 transition-colors disabled:opacity-50"
              placeholder="http://localhost:3000/generate"
            />
            <span className="text-[9px] text-zinc-500 block leading-normal">
              Requires CORS enablement headers matching browser port rules.
            </span>
          </div>

          <div className="pt-4 px-1.5 space-y-1">
            <span className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase block mb-2">
              Capabilities Included
            </span>
            <div className="flex items-center gap-2.5 py-1.5 text-zinc-400 text-xs px-2 rounded hover:bg-zinc-800/40">
              <Cpu className="w-4 h-4 text-zinc-500" />
              <span>Text Chunks Renderer</span>
            </div>
            <div className="flex items-center gap-2.5 py-1.5 text-zinc-400 text-xs px-2 rounded hover:bg-zinc-800/40">
              <Sliders className="w-4 h-4 text-zinc-500" />
              <span>Local Engine Bridge</span>
            </div>
            <div className="flex items-center gap-2.5 py-1.5 text-zinc-400 text-xs px-2 rounded hover:bg-zinc-800/40">
              <History className="w-4 h-4 text-zinc-500" />
              <span>Raw Chunk Logs Console</span>
            </div>
          </div>
        </div>

        {/* Sidebar Footer User Section */}
        <div className="p-3 border-t border-[#2f2f2f] bg-[#171717] flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-2.5 pl-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-zinc-700 to-zinc-900 flex items-center justify-center font-bold text-white text-[10px]">
              N
            </div>
            <div>
              <p className="font-semibold text-zinc-200">NextAI Local</p>
              <p className="text-[10px] text-zinc-500 font-mono">v1.2.0-beta</p>
            </div>
          </div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className={`p-2 rounded-lg hover:bg-zinc-800 transition-all ${showConfig ? "text-white bg-zinc-800" : "text-zinc-500"}`}
            title="Toggle transaction terminal logs"
          >
            <Cpu className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
