'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Bot, Zap, Shield, ChevronDown, MessageSquareText } from 'lucide-react';

export default function NexusPublicAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Bienvenue dans l'infrastructure Nexus. Je suis Sentinel. Comment puis-je vous aider à configurer votre futur écosystème ?" }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    { label: "C'est quoi l'EaaS ?", icon: <Zap size={12} /> },
    { label: "Isolation des données", icon: <Shield size={12} /> },
    { label: "Quels modules ?", icon: <MessageSquareText size={12} /> },
  ];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleAction = (text: string) => {
    setInput(text);
    // On pourrait même déclencher l'envoi automatique ici
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Ici, Sentinel devient un expert marketing/tech
    setTimeout(() => {
      let response = "";
      if (input.toLowerCase().includes("eaas")) {
        response = "L'Ecosystem as a Service (EaaS) dépasse le SaaS : Nexus crée une infrastructure vivante et isolée qui évolue avec votre métier au lieu de vous imposer un cadre rigide.";
      } else {
        response = "Analyse en cours... Nos protocoles permettent un déploiement modulaire immédiat pour ce cas d'usage. Tapez 'propulsion' dans le terminal pour tester.";
      }
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    }, 800);
  };

  return (
    <div className="fixed bottom-8 right-8 z-100 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 40, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, y: 40, filter: 'blur(10px)' }}
            className="mb-6 w-[350px] sm:w-[420px] h-[550px] bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden ring-1 ring-white/10"
          >
            {/* Header Pro */}
            <div className="p-6 border-b border-white/5 bg-linear-to-b from-purple-600/20 to-transparent flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/40">
                    <Bot className="text-white" size={20} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-black tracking-tight text-white">SENTINEL AI</h4>
                  <p className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Nexus Ecosystem Expert</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="bg-white/5 hover:bg-white/10 p-2 rounded-xl transition">
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            {/* Chat Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-none">
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={i} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed ${
                    m.role === 'user' 
                    ? 'bg-purple-600 text-white rounded-tr-none shadow-lg shadow-purple-600/20' 
                    : 'bg-white/5 text-slate-300 rounded-tl-none border border-white/10'
                  }`}>
                    {m.content}
                  </div>
                </motion.div>
              ))}
              
              {/* Quick Actions pour le Public */}
              {messages.length === 1 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {quickActions.map((action, idx) => (
                    <button 
                      key={idx}
                      onClick={() => handleAction(action.label)}
                      className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-purple-600/20 border border-white/10 rounded-full text-[10px] font-bold text-slate-400 hover:text-purple-400 transition-all"
                    >
                      {action.icon} {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input Field */}
            <form onSubmit={handleSendMessage} className="p-6 pt-0">
              <div className="relative flex items-center">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Posez une question technique ou métier..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pr-14 text-sm outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-slate-600"
                />
                <button type="submit" className="absolute right-2 p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all shadow-lg shadow-purple-600/30">
                  <Send size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Futuristic Launcher Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative group flex items-center gap-3 bg-white text-black p-4 pl-6 rounded-full shadow-2xl transition-all hover:bg-purple-600 hover:text-white"
      >
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black uppercase tracking-widest leading-none">Interroger</span>
          <span className="text-xs font-bold opacity-60">Sentinel AI</span>
        </div>
        <div className="w-12 h-12 bg-black text-white group-hover:bg-white group-hover:text-purple-600 rounded-full flex items-center justify-center transition-all shadow-inner">
          {isOpen ? <X size={24} /> : <Sparkles size={24} className="animate-pulse" />}
        </div>
      </motion.button>
    </div>
  );
}