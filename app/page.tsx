"use client";
import React, { useState, useRef, useEffect, FormEvent } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Trash2,
  Terminal,
  Cpu,
  RefreshCw,
  Code,
  AlertCircle,
  Clock,
  Settings,
  HelpCircle,
  Wifi,
  WifiOff,
  ChevronLeft,
  ChevronRight,
  Plus,
  Compass,
  ArrowUp,
  Sliders,
  History,
  Copy,
  Check,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  error?: boolean;
}

interface LogItem {
  id: string;
  time: string;
  type: "info" | "raw_chunk" | "warn" | "success" | "error";
  content: string;
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

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am connected to your local NextAI Engine. Ask me anything to start generating text responses. I fully support real-time Markdown streaming and syntax highlighted code highlights.",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Navigation & Toggle states
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [apiUrl, setApiUrl] = useState<string>(
    "http://localhost:3001/generate",
  );
  const [rawLogs, setRawLogs] = useState<LogItem[]>([]);
  const [useMock, setUseMock] = useState<boolean>(true); // Default mock for browser canvas compatibility

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const samplePrompts = [
    {
      title: "Create React Table",
      desc: "with responsive tailwind configurations",
      prompt:
        "Write a high performance reusable React table layout styled with Tailwind CSS, utilizing flex values.",
    },
    {
      title: "Next.js Streaming Guide",
      desc: "explaining server event protocol details",
      prompt:
        "Draft a comprehensive README.md summarizing server sent event properties of text/event-stream headers in modern Node environments.",
    },
    {
      title: "Debug SSE Handler",
      desc: "solving multi-segment buffer split issues",
      prompt:
        "Explain how buffer segmentation problems are resolved when parsing multiple JSON lines without manual separators.",
    },
  ];

  // Auto-scroll on content updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addLog = (type: LogItem["type"], content: string) => {
    setRawLogs((prev) =>
      [
        ...prev,
        {
          id: Math.random().toString(),
          time: new Date().toLocaleTimeString([], { hour12: false }),
          type,
          content,
        },
      ].slice(-35),
    );
  };

  const handleMockStream = (prompt: string, assistantMsgId: string) => {
    addLog(
      "info",
      `Initializing mock engine parsing: "${prompt.substring(0, 35)}..."`,
    );

    const mockResponses = [
      "# Next.js Stream Integration Guide\n\nTo construct a high-speed Server-Sent Events (SSE) route in Next.js, configure the headers exactly as follows:\n\n```typescript\n// app/generate/route.ts\nimport { NextRequest } from 'next/server';\n\nexport async function POST(req: NextRequest) {\n  const encoder = new TextEncoder();\n  const customStream = new ReadableStream({\n    async start(controller) {\n      controller.enqueue(encoder.encode('data: {\"text\":\"Hello\"}\\n\\n'));\n      controller.enqueue(encoder.encode('data: {\"text\":\" World\"}\\n\\n'));\n      controller.close();\n    }\n  });\n  return new Response(customStream, {\n    headers: {\n      'Content-Type': 'text/event-stream',\n      'Cache-Control': 'no-cache',\n      'Connection': 'keep-alive'\n    }\n  });\n}\n```\n\n### Benefits of this design\n- **Micro-sized latency**: Chunks push directly onto standard downstream sockets.\n- **Zero cumulative layout shifts**: Direct DOM hydration without client state recalculations.\n\nLet me know if you would like me to modify this logic further!",
      'I would be glad to help resolve that bug. Let\'s create an elegant, optimized CSS Grid system for a developer portfolio page:\n\n```html\n<div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">\n  <div class="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition">\n    <h3 class="text-lg font-semibold text-white">Project Alpha</h3>\n    <p class="text-sm text-zinc-400 mt-2">Real-time metrics console dashboard.</p>\n  </div>\n</div>\n```\n\nThis structures your main grid layouts to align naturally on any size monitor without overflow hazards.',
    ];

    const randomResponse =
      mockResponses[Math.floor(Math.random() * mockResponses.length)];
    const chunks = randomResponse.match(/.{1,4}/g) || [randomResponse];

    let currentChunkIndex = 0;
    let accumulatedText = "";

    const interval = setInterval(() => {
      if (currentChunkIndex < chunks.length) {
        const textChunk = chunks[currentChunkIndex];
        accumulatedText += textChunk;

        // Match the user's requested SSE format in output console
        addLog("raw_chunk", `data: ${JSON.stringify({ text: textChunk })}`);

        updateAssistantMessage(assistantMsgId, accumulatedText, true);
        currentChunkIndex++;
      } else {
        clearInterval(interval);

        addLog("success", "Streaming sequence completed.");
        addLog(
          "raw_chunk",
          `data: ${JSON.stringify({ final: accumulatedText })}`,
        );

        updateAssistantMessage(assistantMsgId, accumulatedText, false);
        setIsLoading(false);
      }
    }, 40);
  };

  const extractJsonObjects = (str: string) => {
    const jsonStrings: string[] = [];
    let openBraces = 0;
    let startIdx = -1;
    let inString = false;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === '"' && str[i - 1] !== "\\") {
        inString = !inString;
      }

      if (!inString) {
        if (char === "{") {
          if (openBraces === 0) {
            startIdx = i;
          }
          openBraces++;
        } else if (char === "}") {
          openBraces--;
          if (openBraces === 0 && startIdx !== -1) {
            jsonStrings.push(str.slice(startIdx, i + 1));
            startIdx = -1;
          }
        }
      }
    }

    const remaining = startIdx !== -1 ? str.slice(startIdx) : "";
    return { jsonStrings, remaining };
  };

  const handleSendMessage = async (userPromptText: string) => {
    if (!userPromptText.trim() || isLoading) return;

    setError(null);
    setIsLoading(true);

    const userMsgId = Math.random().toString();
    const assistantMsgId = Math.random().toString();
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", content: userPromptText, timestamp },
    ]);

    setMessages((prev) => [
      ...prev,
      {
        id: assistantMsgId,
        role: "assistant",
        content: "",
        timestamp,
        isStreaming: true,
      },
    ]);

    if (useMock) {
      handleMockStream(userPromptText, assistantMsgId);
      return;
    }

    addLog("info", `Connecting to endpoint: ${apiUrl}`);

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: userPromptText }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Streaming not supported on this endpoint.");
      }

      const decoder = new TextDecoder("utf-8");
      let accumulatedText = "";
      let streamBuffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const rawChunkStr = decoder.decode(value, { stream: true });
        streamBuffer += rawChunkStr;

        const lines = streamBuffer.split("\n");
        streamBuffer = lines.pop() || "";

        for (const line of lines) {
          const trimmedLine = line.trim();
          if (!trimmedLine) continue;

          // Process only data: prefixed lines
          if (trimmedLine.startsWith("data:")) {
            const jsonPayload = trimmedLine.substring(5).trim();
            if (!jsonPayload) continue;

            addLog("raw_chunk", trimmedLine);

            const { jsonStrings } = extractJsonObjects(jsonPayload);

            for (const jsonStr of jsonStrings) {
              try {
                const parsed = JSON.parse(jsonStr);

                if (parsed.text !== undefined) {
                  accumulatedText += parsed.text;
                  updateAssistantMessage(assistantMsgId, accumulatedText, true);
                } else if (parsed.final !== undefined) {
                  accumulatedText = parsed.final;
                  updateAssistantMessage(
                    assistantMsgId,
                    accumulatedText,
                    false,
                  );
                  addLog("success", "Assembling final stream data.");
                }
              } catch (jsonErr) {
                addLog("warn", `JSON parsing warning on frame: "${jsonStr}"`);
              }
            }
          }
        }
      }

      // Check residual buffer on complete
      if (streamBuffer.trim()) {
        const trimmed = streamBuffer.trim();
        if (trimmed.startsWith("data:")) {
          const jsonPayload = trimmed.substring(5).trim();
          try {
            const parsed = JSON.parse(jsonPayload);
            if (parsed.text !== undefined) {
              accumulatedText += parsed.text;
            } else if (parsed.final !== undefined) {
              accumulatedText = parsed.final;
            }
            updateAssistantMessage(assistantMsgId, accumulatedText, false);
          } catch (e) {
            addLog("warn", `Final flush buffer warning: "${jsonPayload}"`);
          }
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId ? { ...m, isStreaming: false } : m,
        ),
      );
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      addLog("error", err.message);

      setMessages((prev) => {
        return prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: "Failed to retrieve response.",
                isStreaming: false,
                error: true,
              }
            : m,
        );
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateAssistantMessage = (
    id: string,
    newContent: string,
    isStreaming = true,
  ) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, content: newContent, isStreaming } : m,
      ),
    );
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "Chat history cleared. Send a new prompt to start again.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setRawLogs([]);
  };

  return (
    <div className="flex h-screen w-full bg-[#212121] text-zinc-200 font-sans overflow-hidden antialiased select-none">
      {/* SIDEBAR - GPT STYLE COLLAPSIBLE PANEL */}
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
                <p className="text-[10px] text-zinc-500 font-mono">
                  v1.2.0-beta
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowConfig(!showConfig)}
              className={`p-2 rounded-lg hover:bg-zinc-800 transition-all ${showConfig ? "text-white bg-zinc-800" : "text-zinc-500"}`}
              title="Toggle transaction terminal logs"
            >
              <Terminal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* FLOATING SIDEBAR OPEN TRIGGER */}
      {!showSidebar && (
        <button
          onClick={() => setShowSidebar(true)}
          className="fixed left-4 top-4 p-2 rounded-lg bg-[#171717] border border-[#2f2f2f] text-zinc-400 hover:text-white transition-all z-30 cursor-pointer shadow-lg hover:scale-105"
          title="Open sidebar"
        >
          <ChevronRight className="w-4.5 h-4.5" />
        </button>
      )}

      {/* MAIN APPLICATION FRAME */}
      <div className="flex-1 flex flex-col h-full bg-[#212121] overflow-hidden relative">
        {/* TOP STATUS HEADER BAR */}
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

          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all"
              title="Clear current convo history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* WORKSPACE AREA */}
        <div className="flex-1 flex overflow-hidden">
          {/* CHAT MESSAGES PORTFOLIO CONTAINER */}
          <div className="flex-1 flex flex-col h-full justify-between overflow-hidden relative">
            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto px-4 md:px-0 py-8 space-y-8 select-text">
              <div className="max-w-2xl mx-auto space-y-8">
                {/* GPT Landing style welcome chips if chat is empty or contains only assistant message */}
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
                        Test and capture micro JSON fragments streaming
                        dynamically into your local environment database system.
                      </p>
                    </div>

                    {/* Pre-flight sample prompt chips */}
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

                {/* Message items loop - GPT Style direct background rendering */}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-5 border-b border-zinc-900/10 pb-6 last:border-0 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {/* Assistant Avatar */}
                    {msg.role !== "user" && (
                      <div className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 shadow-sm text-zinc-300">
                        <Bot className="w-4 h-4 text-zinc-300" />
                      </div>
                    )}

                    {/* Content Area */}
                    <div className="flex-1 max-w-full space-y-1">
                      {/* Message Meta Info */}
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 mb-1 select-none">
                        <span className="font-semibold text-zinc-400">
                          {msg.role === "user" ? "You" : "NextAI"}
                        </span>
                        <span>•</span>
                        <span className="font-light">{msg.timestamp}</span>
                      </div>

                      {/* Styled Message Wrapper */}
                      <div
                        className={`text-[14.5px] leading-relaxed select-text
                        ${
                          msg.role === "user"
                            ? "bg-zinc-800/60 hover:bg-zinc-800/80 transition px-4 py-2.5 rounded-2xl border border-zinc-800 text-zinc-200 max-w-[80%] ml-auto w-fit font-light"
                            : "text-zinc-300 pr-4"
                        }
                      `}
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

                        {/* Stream indicator inside message */}
                        {msg.isStreaming && msg.content !== "" && (
                          <span className="inline-flex mt-3.5 items-center gap-1.5 text-[10px] text-zinc-400 bg-zinc-850 px-2 py-0.5 rounded border border-zinc-800 font-mono select-none">
                            <RefreshCw className="w-3 h-3 animate-spin text-zinc-400" />
                            <span>streaming chunks...</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* User Avatar */}
                    {msg.role === "user" && (
                      <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center shrink-0 shadow-sm text-zinc-200 font-bold text-[10px] select-none">
                        U
                      </div>
                    )}
                  </div>
                ))}

                {/* Error Banner Container */}
                {error && (
                  <div className="bg-red-950/20 border border-red-900/50 text-red-200 p-4 rounded-xl flex gap-3 items-start my-4">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="text-sm flex-1 space-y-2">
                      <p className="font-semibold text-red-300">
                        Connection Failed: Fetching context failed
                      </p>
                      <p className="opacity-90 text-[12.5px] leading-relaxed text-zinc-300 font-light">
                        Standard browser environments prevent cross-protocol
                        calls (from this secure dashboard to insecure local
                        routes like{" "}
                        <code className="bg-[#171717] px-1 py-0.5 rounded text-white text-[11px] font-mono">
                          http://localhost:3000
                        </code>
                        ).
                      </p>
                      <div className="p-3 bg-zinc-950/40 rounded-lg text-[11.5px] font-mono text-zinc-400 space-y-1 border border-zinc-850">
                        <span className="text-zinc-200 block font-semibold mb-1">
                          To Resolve Direct Connection:
                        </span>
                        <div>
                          1. Switch Sidebar Target Mode to{" "}
                          <strong className="text-zinc-100">Sandbox</strong> to
                          run and review simulation streams inside this canvas
                          frame.
                        </div>
                        <div>
                          2. Copy and export this completed component to your
                          own Next.js project on local port localhost.
                        </div>
                        <div>
                          3. Assure your local Express controller includes
                          standard CORS headers configuration parameters.
                        </div>
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

            {/* BOTTOM INPUT CONTAINER */}
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
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (input.trim() && !isLoading) {
                      const text = input;
                      setInput("");
                      handleSendMessage(text);
                    }
                  }}
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
          </div>

          {/* COLLAPSIBLE RAW LOGS SYSTEM CONSOLE */}
          {showConfig && (
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
          )}
        </div>
      </div>
    </div>
  );
}
