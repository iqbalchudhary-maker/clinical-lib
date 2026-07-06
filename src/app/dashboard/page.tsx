"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Send, GraduationCap } from "lucide-react";
import Image from "next/image";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#0a192f] via-[#112240] to-[#0a192f] text-white">

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-[#0a192f]/80 border-b border-blue-900/50 px-6 py-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <Image 
            src="/logo.jpeg" 
            alt="Uswa College Logo" 
            width={40} 
            height={40} 
            className="rounded-full border border-blue-500/30"
          />
          <h1 className="text-xl font-bold tracking-wide">Uswa College Bhowana</h1>
        </div>
        <span className="text-xs text-blue-300 bg-blue-900/30 px-3 py-1 rounded-full border border-blue-800">
          AI Assistant
        </span>
      </header>

      {/* ================= CHAT AREA ================= */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-blue-200">
            <GraduationCap size={48} className="mb-4 opacity-50" />
            <div className="text-2xl font-semibold mb-2">Welcome to Uswa College AI</div>
            <p className="text-sm opacity-70 max-w-sm">
              Ask about admissions, fee structures, courses, or college rules.
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`px-4 py-3 rounded-2xl max-w-[80%] shadow-md border ${
                  m.role === "user" 
                  ? "bg-blue-600 text-white border-blue-500" 
                  : "bg-[#112240] border-blue-900 text-gray-100"
                }`}>
                  {/* Error fixed by using a wrapper div instead of className on ReactMarkdown */}
                  <div className="prose prose-invert prose-sm">
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  </div>
                  <div className="text-[10px] text-blue-300/50 mt-2">{m.timestamp}</div>
                </div>
              </div>
            ))}
            {isLoading && <div className="text-blue-400 text-sm animate-pulse ml-4">Assistant is typing...</div>}
          </div>
        )}
      </div>

      {/* ================= INPUT ================= */}
      <div className="p-4 border-t border-blue-900/50 bg-[#112240]/50 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex items-center gap-2 bg-[#0a192f] border border-blue-800 rounded-2xl px-3 py-2 shadow-lg">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything about Uswa College..."
            className="flex-1 bg-transparent outline-none text-white placeholder-blue-500 resize-none px-2"
            rows={1}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          />
          <button
            onClick={() => sendMessage(input)}
            className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-xl shadow-md"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      <footer className="py-4 border-t border-blue-900/30 text-center text-[10px] text-blue-500">
        © {new Date().getFullYear()} Uswa College Bhowana | Powered by SM Tech AI Solutions
      </footer>
    </div>
  );
}