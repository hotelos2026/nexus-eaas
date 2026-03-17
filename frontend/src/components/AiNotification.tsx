'use client';
import { Bot, X, ShieldAlert, CheckCircle2, Sparkles } from 'lucide-react';

interface AiNotificationProps {
  message: string;
  type: 'error' | 'success' | 'ai';
  isVisible: boolean;
  onClose: () => void;
}

export default function AiNotification({ message, type, isVisible, onClose }: AiNotificationProps) {
  if (!isVisible) return null;

  const themes = {
    error: { icon: <ShieldAlert size={20} className="text-red-400" />, shadow: 'shadow-red-900/20', border: 'border-red-500/30', bg: 'bg-red-950/40', text: 'text-red-200' },
    success: { icon: <CheckCircle2 size={20} className="text-emerald-400" />, shadow: 'shadow-emerald-900/20', border: 'border-emerald-500/30', bg: 'bg-emerald-950/40', text: 'text-emerald-100' },
    ai: { icon: <Sparkles size={20} className="text-purple-400" />, shadow: 'shadow-purple-900/20', border: 'border-purple-500/30', bg: 'bg-purple-950/40', text: 'text-purple-100' }
  };

  const theme = themes[type];

  return (
    <div className="fixed top-6 right-6 z-9999 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className={`relative overflow-hidden backdrop-blur-xl border ${theme.border} ${theme.bg} p-5 rounded-2xl shadow-2xl ${theme.shadow} w-[340px]`}>
        
        {/* Ligne de scan laser animée - Optimisée v4 */}
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-white/40 to-transparent animate-pulse" />
        
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-black/60 rounded-xl border border-white/10 shadow-inner">
            {theme.icon}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <Bot size={14} className="text-gray-400" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Nexus Intelligence</span>
            </div>
            <p className={`text-sm font-medium leading-relaxed ${theme.text}`}>
              {message}
            </p>
          </div>

          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors text-gray-500 hover:text-white cursor-pointer">
            <X size={16} />
          </button>
        </div>

        {/* Barre de progression de lecture */}
        <div className="absolute bottom-0 left-0 h-[2px] bg-white/10 w-full">
           <div className="h-full bg-current opacity-30 animate-[shrink_5s_linear_forwards]" />
        </div>
      </div>
    </div>
  );
}