"use client";
import { Bot, X, ShieldAlert, CheckCircle2, Sparkles } from "lucide-react";

interface AiNotificationProps {
  message: string;
  type: "error" | "success" | "ai";
  isVisible: boolean;
  onClose: () => void;
}

export default function AiNotification({
  message,
  type,
  isVisible,
  onClose,
}: AiNotificationProps) {
  if (!isVisible) return null;

  const themes = {
    error: {
      icon: <ShieldAlert size={20} className="text-red-400" />,
      shadow: "shadow-red-900/20",
      border: "border-red-500/30",
      bg: "bg-red-950/40",
      text: "text-red-200",
    },
    success: {
      icon: <CheckCircle2 size={20} className="text-emerald-400" />,
      shadow: "shadow-emerald-900/20",
      border: "border-emerald-500/30",
      bg: "bg-emerald-950/40",
      text: "text-emerald-100",
    },
    ai: {
      icon: <Sparkles size={20} className="text-purple-400" />,
      shadow: "shadow-purple-900/20",
      border: "border-purple-500/30",
      bg: "bg-purple-950/40",
      text: "text-purple-100",
    },
  };

  const theme = themes[type];

  return (
    <div className="animate-in fade-in slide-in-from-top-4 fixed top-6 right-6 z-9999 duration-300">
      <div
        className={`relative overflow-hidden border backdrop-blur-xl ${theme.border} ${theme.bg} rounded-2xl p-5 shadow-2xl ${theme.shadow} w-[340px]`}
      >
        {/* Ligne de scan laser animée - Optimisée v4 */}
        <div className="absolute top-0 left-0 h-px w-full animate-pulse bg-linear-to-r from-transparent via-white/40 to-transparent" />

        <div className="flex items-start gap-4">
          <div className="rounded-xl border border-white/10 bg-black/60 p-2.5 shadow-inner">
            {theme.icon}
          </div>

          <div className="flex-1">
            <div className="mb-1.5 flex items-center gap-2">
              <Bot size={14} className="text-gray-400" />
              <span className="text-[10px] font-black tracking-[0.2em] text-gray-400 uppercase">
                Nexus Intelligence
              </span>
            </div>
            <p className={`text-sm leading-relaxed font-medium ${theme.text}`}>
              {message}
            </p>
          </div>

          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-gray-500 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* Barre de progression de lecture */}
        <div className="absolute bottom-0 left-0 h-[2px] w-full bg-white/10">
          <div className="h-full animate-[shrink_5s_linear_forwards] bg-current opacity-30" />
        </div>
      </div>
    </div>
  );
}
