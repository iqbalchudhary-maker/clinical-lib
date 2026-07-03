"use client";

import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Send } from "lucide-react";

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
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
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
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
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
    <div className="flex flex-col h-screen bg-gradient-to-br from-[#0B0F1A] via-[#0F1117] to-[#0B0F1A] text-white">

      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-10 backdrop-blur-xl bg-white/5 border-b border-white/10 px-6 py-4 flex justify-between items-center shadow-lg">
        <h1 className="text-xl font-bold tracking-wide">
          ✨ Glow Aesthetic Clinic
        </h1>

        <span className="text-sm text-gray-300 bg-white/5 px-3 py-1 rounded-full border border-white/10">
          {new Date().toLocaleDateString()}
        </span>
      </header>

      {/* ================= CHAT AREA ================= */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-2xl font-semibold mb-2">
              Welcome to AI Clinic Assistant
            </div>
            <p className="text-gray-400 text-sm">
              Ask anything about treatments, appointments, or pricing
            </p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-5">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${
                  m.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`px-4 py-3 rounded-2xl max-w-[80%] shadow-md backdrop-blur-md border transition-all duration-200 ${
                    m.role === "user"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                      : "bg-white/5 border-white/10 text-gray-100"
                  }`}
                >
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                  <div className="text-[10px] text-gray-400 mt-2">
                    {m.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="text-gray-400 text-sm animate-pulse">
                AI is typing...
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= INPUT ================= */}
      <div className="p-4 border-t border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-2 shadow-lg">
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent outline-none text-white placeholder-gray-400 resize-none px-2"
            rows={1}
          />

          <button
            onClick={() => sendMessage(input)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition px-4 py-2 rounded-xl shadow-md"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      <footer className="w-full py-6 border-t border-white/10 bg-[#0F1117]/50 backdrop-blur-md">
  <div className="max-w-3xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
    <p>© {new Date().getFullYear()} Glow Aesthetic Clinic. All rights reserved.</p>
    <div className="flex items-center gap-2">
      <span>Powered by</span>
      <span className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
        SM Technology
      </span>
    </div>
  </div>
</footer>
    </div>
  );
}