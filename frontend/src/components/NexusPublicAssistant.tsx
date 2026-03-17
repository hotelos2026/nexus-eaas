'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Bot } from 'lucide-react';

export default function NexusPublicAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [localInput, setLocalInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
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
    setDisplayedText('');

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

    const userMessage = { role: 'user', content: localInput.trim() };
    const currentMessages = [...messages, userMessage];

    setMessages(currentMessages);
    setLocalInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: currentMessages }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      // bulle assistant vide
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

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
          role: 'assistant',
          content: fullText,
        };
        return next;
      });

    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Erreur de connexion.' },
      ]);
    } finally {
      setIsLoading(false);
      setDisplayedText('');
    }
  };

  const suggestions = [
    "propulsion",
    "Créer une app scalable",
    "C’est quoi Nexus ?"
  ];

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50 flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="mb-4 w-[92vw] sm:w-[380px] h-[70vh] sm:h-[520px]
            bg-[#0b0b12]/95 backdrop-blur-xl border border-white/10
            rounded-2xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot size={16} className="text-purple-500" />
                <span className="text-white text-xs font-semibold">
                  Sentinel
                </span>
              </div>
              <button onClick={() => setIsOpen(false)}>
                <X size={18} className="text-white/40 hover:text-white" />
              </button>
            </div>

            {/* Chat */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 text-sm">
              {messages.length === 0 && (
                <div className="text-center text-white/40 text-xs space-y-3">
                  <p>Pose une question ou essaye :</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setLocalInput(s)}
                        className="px-3 py-1 bg-white/5 border border-white/10 rounded-full hover:bg-purple-600/30 text-[11px]"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`px-3 py-2 rounded-xl max-w-[85%] ${
                    m.role === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/5 text-gray-200 border border-white/10'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="text-purple-400 text-xs animate-pulse">
                  {displayedText || "Sentinel écrit..."}
                </div>
              )}
            </div>

            {/* Input */}
            <form onSubmit={onHandleSubmit} className="p-3 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  value={localInput}
                  onChange={(e) => setLocalInput(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-purple-500 outline-none"
                  placeholder="Écrire..."
                />
                <button
                  type="submit"
                  disabled={!localInput.trim()}
                  className="bg-purple-600 p-2 rounded-lg text-white hover:bg-purple-500 disabled:opacity-30"
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
        className="bg-white text-black px-5 py-3 rounded-full flex items-center gap-2 text-xs font-semibold hover:bg-purple-600 hover:text-white transition pointer-events-auto"
      >
        <Sparkles size={16} />
        {isOpen ? 'Fermer' : 'Sentinel'}
      </button>
    </div>
  );
}