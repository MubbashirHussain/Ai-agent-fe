// client/app/components/InputBar.tsx
"use client";
import React, { useState, useRef } from "react";
import { Compass, ArrowUp, X, Image, Square } from "lucide-react";

interface InputBarProps {
  isLoading: boolean;
  useMock: boolean;
  onSend: (text: string, imageBase64?: string) => void;
  onStop: () => void;
  disableImageUpload?: boolean;
}

export default function InputBar({
  isLoading,
  useMock,
  onSend,
  onStop,
  disableImageUpload,
}: InputBarProps) {
  const [input, setInput] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || imagePreview) && !isLoading) {
      onSend(input, imagePreview || undefined);
      setInput("");
      setImagePreview(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gradient-to-t from-[#212121] via-[#212121] to-transparent shrink-0 z-10 select-none">
      <div className="max-w-2xl mx-auto space-y-2">
        {/* Image Preview Container */}
        {imagePreview && (
          <div className="relative inline-block border border-zinc-800 bg-[#171717] p-1.5 rounded-lg max-w-[120px]">
            <img
              src={imagePreview}
              alt="Upload preview"
              className="w-24 h-24 object-cover rounded-md"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-1.5 -right-1.5 bg-zinc-850 border border-zinc-800 rounded-full p-1 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Floating controls indicator bar */}
        <div className="flex items-center justify-between mb-2 px-1 text-[11px] text-zinc-500">
          <div className="flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-zinc-600" />
            <span>
              Mode:{" "}
              {useMock ? "Sandbox Standalone Simulator" : "Direct API Bridge"}
            </span>
          </div>
          {useMock && (
            <span className="text-zinc-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full inline-block animate-pulse" />
              Standalone Simulation Active
            </span>
          )}
        </div>

        {/* Main input control form */}
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center bg-[#2f2f2f] border border-zinc-800 focus-within:border-zinc-700 rounded-2xl shadow-xl transition-all p-1.5"
        >
          {/* File Upload Trigger */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2.5 rounded-xl hover:bg-zinc-850 text-zinc-400 hover:text-zinc-200 transition-all cursor-pointer ${disableImageUpload ? "opacity-30" : ""}`}
            title={
              disableImageUpload
                ? "This model does not support image upload"
                : "Attach image"
            }
            disabled={disableImageUpload}
          >
            <Image className="w-4 h-4" />
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            className="hidden"
          />

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              useMock
                ? "Send simulation prompt..."
                : "Ask your active local generator API..."
            }
            className="w-full bg-transparent px-4 py-3 text-[14px] text-zinc-200 placeholder-zinc-500 outline-none pr-28 font-light"
            disabled={isLoading}
          />

          <div className="absolute right-3 flex items-center gap-1.5 justify-end">
            <button
              type={isLoading ? "button" : "submit"}
              onClick={isLoading ? onStop : undefined}
              disabled={!isLoading && !input.trim() && !imagePreview}
              className="p-2 rounded-xl bg-zinc-50 hover:bg-zinc-50/90 text-black hover:opacity-100 disabled:opacity-100 disabled:bg-zinc-100 disabled:text-zinc-500 transition-all shadow cursor-pointer flex items-center justify-center active:scale-95"
            >
              {isLoading ? (
                <Square className="w-4 h-4 fill-current" />
              ) : (
                <ArrowUp className="w-4 h-4 font-bold" />
              )}
            </button>
          </div>
        </form>

        <p className="text-[10px] text-zinc-500 text-center mt-2">
          Parsed payloads correspond with SSE structure definitions. Stream
          parses dynamic keys automatically.
        </p>
      </div>
    </div>
  );
}
