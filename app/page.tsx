// client/app/page.tsx
"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import MessageList from "./components/MessageList";
import InputBar from "./components/InputBar";
import LogConsole from "./components/LogConsole";

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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Navigation & Toggle states
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [apiUrl, setApiUrl] = useState<string>("http://localhost:3001/generate");
  const [rawLogs, setRawLogs] = useState<LogItem[]>([]);
  const [useMock, setUseMock] = useState<boolean>(true); // Default mock for browser canvas compatibility

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
      ].slice(-35)
    );
  };

  const updateAssistantMessage = (
    id: string,
    newContent: string,
    isStreaming = true
  ) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, content: newContent, isStreaming } : m
      )
    );
  };

  const handleMockStream = (prompt: string, assistantMsgId: string) => {
    addLog(
      "info",
      `Initializing mock engine parsing: "${prompt.substring(0, 35)}..."`
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

        addLog("raw_chunk", `data: ${JSON.stringify({ text: textChunk })}`);

        updateAssistantMessage(assistantMsgId, accumulatedText, true);
        currentChunkIndex++;
      } else {
        clearInterval(interval);

        addLog("success", "Streaming sequence completed.");
        addLog(
          "raw_chunk",
          `data: ${JSON.stringify({ final: accumulatedText })}`
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
                  updateAssistantMessage(assistantMsgId, accumulatedText, false);
                  addLog("success", "Assembling final stream data.");
                }
              } catch (jsonErr) {
                addLog("warn", `JSON parsing warning on frame: "${jsonStr}"`);
              }
            }
          }
        }
      }

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
          m.id === assistantMsgId ? { ...m, isStreaming: false } : m
        )
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
            : m
        );
      });
    } finally {
      setIsLoading(false);
    }
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
      {/* SIDEBAR PANEL */}
      <Sidebar
        showSidebar={showSidebar}
        setShowSidebar={setShowSidebar}
        useMock={useMock}
        setUseMock={setUseMock}
        apiUrl={apiUrl}
        setApiUrl={setApiUrl}
        clearChat={clearChat}
        showConfig={showConfig}
        setShowConfig={setShowConfig}
        setError={setError}
      />

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
        <Header />

        {/* WORKSPACE AREA */}
        <div className="flex-1 flex overflow-hidden">
          {/* CHAT CONTAINER */}
          <div className="flex-1 flex flex-col h-full justify-between overflow-hidden relative">
            <MessageList
              messages={messages}
              error={error}
              setError={setError}
              setUseMock={setUseMock}
              handleSendMessage={handleSendMessage}
              messagesEndRef={messagesEndRef}
            />

            <InputBar isLoading={isLoading} useMock={useMock} onSend={handleSendMessage} />
          </div>

          {/* COLLAPSIBLE LOGS SYSTEM CONSOLE */}
          {showConfig && <LogConsole rawLogs={rawLogs} setRawLogs={setRawLogs} />}
        </div>
      </div>
    </div>
  );
}
