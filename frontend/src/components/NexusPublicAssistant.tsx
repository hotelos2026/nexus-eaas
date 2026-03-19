"use client";

import React, { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, X, Bot } from "lucide-react";

export default function NexusPublicAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [localInput, setLocalInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, displayedText]);

  // Auto focus
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Typing effect
  const typeText = async (text: string) => {
    let i = 0;
    setDisplayedText("");

    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        i++;
        setDisplayedText(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          resolve();
        }
      }, 12); // vitesse typing
    });
  };

  const onHandleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!localInput.trim() || isLoading) return;

    const userMessage = { role: "user", content: localInput.trim() };
    const currentMessages = [...messages, userMessage];

    setMessages(currentMessages);
    setLocalInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: currentMessages }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      // bulle assistant vide
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          fullText += chunk;
        }
      }

      // 🔥 typing réel
      await typeText(fullText);

      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = {
          role: "assistant",
          content: fullText,
        };
        return next;
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Erreur de connexion." },
      ]);
    } finally {
      setIsLoading(false);
      setDisplayedText("");
    }
  };

  const suggestions = [
    "propulsion",
    "Créer une app scalable",
    "C’est quoi Nexus ?",
  ];

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col items-end sm:right-8 sm:bottom-8">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="pointer-events-auto mb-4 flex h-[70vh] w-[92vw] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b12]/95 shadow-2xl backdrop-blur-xl sm:h-[520px] sm:w-[380px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
              <div className="flex items-center gap-2">
                <Bot size={16} className="text-purple-500" />
                <span className="text-xs font-semibold text-white">
                  Sentinel
                </span>
              </div>
              <button onClick={() => setIsOpen(false)}>
                <X size={18} className="text-white/40 hover:text-white" />
              </button>
            </div>

            {/* Chat */}
            <div
              ref={scrollRef}
              className="flex-1 space-y-3 overflow-y-auto p-4 text-sm"
            >
              {messages.length === 0 && (
                <div className="space-y-3 text-center text-xs text-white/40">
                  <p>Pose une question ou essaye :</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setLocalInput(s)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] hover:bg-purple-600/30"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 ${
                      m.role === "user"
                        ? "bg-purple-600 text-white"
                        : "border border-white/10 bg-white/5 text-gray-200"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="animate-pulse text-xs text-purple-400">
                  {displayedText || "Sentinel écrit..."}
                </div>
              )}
            </div>

            {/* Input */}
            <form
              onSubmit={onHandleSubmit}
              className="border-t border-white/5 p-3"
            >
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={localInput}
                  onChange={(e) => setLocalInput(e.target.value)}
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
                  placeholder="Écrire..."
                />
                <button
                  type="submit"
                  disabled={!localInput.trim()}
                  className="rounded-lg bg-purple-600 p-2 text-white hover:bg-purple-500 disabled:opacity-30"
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-semibold text-black transition hover:bg-purple-600 hover:text-white"
      >
        <Sparkles size={16} />
        {isOpen ? "Fermer" : "Sentinel"}
      </button>
    </div>
  );
}
