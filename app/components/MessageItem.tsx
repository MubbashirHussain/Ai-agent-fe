// client/app/components/MessageItem.tsx
"use client";
import React, { useState } from "react";
import { Copy, Check, Bot, RefreshCw, Code } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  error?: boolean;
}

const CodeBlock = ({
  code,
  language,
  isStreaming = false,
}: {
  code: string;
  language: string;
  isStreaming?: boolean;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-[#2f2f2f] bg-[#0d0d0d] shadow-lg max-w-full font-mono text-xs">
      <div className="flex items-center justify-between px-4 py-2 bg-[#171717] border-b border-[#212121] text-[11px] text-zinc-400 select-none">
        <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-zinc-300">
          <Code className="w-3.5 h-3.5 text-zinc-400" />
          {language || "code"}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="px-2 py-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all flex items-center gap-1.5 active:scale-95"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto select-all text-zinc-200 leading-relaxed font-mono whitespace-pre text-left">
        {code}
        {isStreaming && (
          <span className="inline-block w-1.5 h-3.5 bg-zinc-400 ml-1 animate-pulse" />
        )}
      </div>
    </div>
  );
};

const parseInlineFormatting = (text: string): React.ReactNode => {
  const tokens: { type: "text" | "code" | "bold" | "italic"; val: string }[] = [
    { type: "text", val: text },
  ];

  const tokenize = (type: "code" | "bold" | "italic", regex: RegExp) => {
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type === "text") {
        const val = tokens[i].val;
        const parts = val.split(regex);
        if (parts.length > 1) {
          const newTokens: typeof tokens = [];
          for (let j = 0; j < parts.length; j++) {
            if (j % 2 === 1) {
              newTokens.push({ type, val: parts[j] });
            } else {
              if (parts[j]) newTokens.push({ type: "text", val: parts[j] });
            }
          }
          tokens.splice(i, 1, ...newTokens);
          i += newTokens.length - 1;
        }
      }
    }
  };

  tokenize("code", /`([^`]+)`/g);
  tokenize("bold", /\*\*([^*]+)\*\*/g);
  tokenize("bold", /__([^_]+)__/g);
  tokenize("italic", /\*([^*]+)\*/g);
  tokenize("italic", /_([^_]+)_/g);

  return (
    <>
      {tokens.map((t, idx) => {
        if (t.type === "code") {
          return (
            <code
              key={idx}
              className="bg-[#2f2f2f]/60 text-zinc-100 font-mono text-[12px] px-1.5 py-0.5 rounded border border-zinc-700 mx-0.5"
            >
              {t.val}
            </code>
          );
        }
        if (t.type === "bold") {
          return (
            <strong key={idx} className="font-semibold text-white">
              {t.val}
            </strong>
          );
        }
        if (t.type === "italic") {
          return (
            <em key={idx} className="italic text-zinc-300">
              {t.val}
            </em>
          );
        }
        return <span key={idx}>{t.val}</span>;
      })}
    </>
  );
};

const MarkdownRenderer = ({ content }: { content: string }) => {
  const blocks: React.ReactNode[] = [];
  const lines = content.split("\n");

  let inCodeBlock = false;
  let codeLanguage = "";
  let codeContent: string[] = [];
  let currentTextLines: string[] = [];

  const flushText = (key: string) => {
    if (currentTextLines.length === 0) return;
    const textSection = currentTextLines.join("\n");
    blocks.push(
      <div key={key} className="space-y-2">
        {renderTextSection(textSection)}
      </div>,
    );
    currentTextLines = [];
  };

  const renderTextSection = (text: string): React.ReactNode[] => {
    const rawLines = text.split("\n");
    const rendered: React.ReactNode[] = [];
    let inList = false;
    let listItems: string[] = [];

    const flushList = (key: string) => {
      if (listItems.length > 0) {
        rendered.push(
          <ul key={key} className="list-disc pl-6 space-y-1 my-3 text-zinc-300">
            {listItems.map((item, idx) => (
              <li key={idx} className="text-[14.5px] leading-relaxed">
                {parseInlineFormatting(item)}
              </li>
            ))}
          </ul>,
        );
        listItems = [];
        inList = false;
      }
    };

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i];
      const trimmed = line.trim();

      if (trimmed.startsWith("#")) {
        flushList(`list-pre-h-${i}`);
        const depth = trimmed.match(/^#+/)?.[0].length || 0;
        const headerText = trimmed.replace(/^#+\s*/, "");
        const cleanText = parseInlineFormatting(headerText);

        if (depth === 1) {
          rendered.push(
            <h1 key={i} className="text-2xl font-bold mt-6 mb-3 text-white">
              {cleanText}
            </h1>,
          );
        } else if (depth === 2) {
          rendered.push(
            <h2 key={i} className="text-xl font-semibold mt-5 mb-2 text-white">
              {cleanText}
            </h2>,
          );
        } else {
          rendered.push(
            <h3 key={i} className="text-lg font-medium mt-4 mb-2 text-zinc-200">
              {cleanText}
            </h3>,
          );
        }
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        inList = true;
        listItems.push(trimmed.slice(2));
      } else if (/^\d+\.\s/.test(trimmed)) {
        flushList(`list-pre-ol-${i}`);
        const cleanContent = trimmed.replace(/^\d+\.\s+/, "");
        rendered.push(
          <div
            key={i}
            className="flex gap-2.5 my-1 text-zinc-300 pl-1 items-start text-[14.5px] leading-relaxed"
          >
            <span className="font-mono text-zinc-500 shrink-0 select-none">
              {trimmed.match(/^\d+/)?.[0]}.
            </span>
            <div className="flex-1">{parseInlineFormatting(cleanContent)}</div>
          </div>,
        );
      } else if (trimmed === "") {
        flushList(`list-pre-blank-${i}`);
      } else {
        flushList(`list-pre-text-${i}`);
        rendered.push(
          <p
            key={i}
            className="text-[14.5px] leading-relaxed text-zinc-300 font-light my-2"
          >
            {parseInlineFormatting(line)}
          </p>,
        );
      }
    }

    flushList("final-list");
    return rendered;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        blocks.push(
          <CodeBlock
            key={`code-${i}`}
            code={codeContent.join("\n")}
            language={codeLanguage}
          />,
        );
        codeContent = [];
        codeLanguage = "";
        inCodeBlock = false;
      } else {
        flushText(`text-precode-${i}`);
        inCodeBlock = true;
        codeLanguage = line.trim().slice(3).trim();
      }
    } else {
      if (inCodeBlock) {
        codeContent.push(line);
      } else {
        currentTextLines.push(line);
      }
    }
  }

  if (inCodeBlock) {
    blocks.push(
      <CodeBlock
        key="unclosed-code"
        code={codeContent.join("\n")}
        language={codeLanguage}
        isStreaming={true}
      />,
    );
  } else {
    flushText("final-text");
  }

  return <div className="space-y-1.5">{blocks}</div>;
};

export default function MessageItem({ msg }: { msg: Message }) {
  return (
    <div
      className={`flex gap-5 border-b border-zinc-900/10 pb-6 last:border-0 ${
        msg.role === "user" ? "justify-end" : "justify-start"
      }`}
    >
      {msg.role !== "user" && (
        <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 shadow-sm text-zinc-300">
          <Bot className="w-4 h-4 text-zinc-300" />
        </div>
      )}

      <div className="flex-1 max-w-full space-y-1">
        <div className="flex items-center gap-2 text-[11px] text-zinc-500 mb-1 select-none font-sans">
          <span className="font-semibold text-zinc-400">
            {msg.role === "user" ? "You" : "NextAI"}
          </span>
          <span>•</span>
          <span className="font-light">{msg.timestamp}</span>
        </div>

        <div
          className={`text-[14.5px] leading-relaxed select-text transition-all duration-200 ${
            msg.role === "user"
              ? "bg-zinc-800/60 hover:bg-zinc-800/80 transition px-4 py-2.5 rounded-2xl border border-zinc-800 text-zinc-200 max-w-[80%] ml-auto w-fit font-light"
              : "text-zinc-300 pr-4"
          }`}
        >
          {msg.content === "" && msg.isStreaming ? (
            <div className="flex items-center gap-1.5 py-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce" />
            </div>
          ) : (
            <MarkdownRenderer content={msg.content} />
          )}

          {msg.isStreaming && msg.content !== "" && (
            <span className="inline-flex mt-3.5 items-center gap-1.5 text-[10px] text-zinc-400 bg-zinc-850 px-2 py-0.5 rounded border border-zinc-800 font-mono select-none">
              <RefreshCw className="w-3 h-3 animate-spin text-zinc-400" />
              <span>streaming chunks...</span>
            </span>
          )}
        </div>
      </div>

      {msg.role === "user" && (
        <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 shadow-sm text-zinc-200 font-bold text-[10px] select-none">
          U
        </div>
      )}
    </div>
  );
}
