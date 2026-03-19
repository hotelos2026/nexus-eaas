"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  LayoutGrid,
  ChevronRight,
  Layers,
  Sparkles,
  Loader2,
  X,
  Shield,
  Cpu,
  Boxes,
  Activity,
  Zap,
} from "lucide-react";
import NexusPublicAssistant from "@/components/NexusPublicAssistant";

export default function LandingPage() {
  const [searchTenant, setSearchTenant] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => setShowPopup(false), 12000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  const handleFindInstance = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchTenant.trim().toLowerCase();

    if (query === "propulsion") {
      setIsVerifying(true);
      setTimeout(() => router.push("/register"), 800);
      return;
    }

    if (query.length < 2) return;

    setIsVerifying(true);
    setShowPopup(false);

    try {
      const response = await api.get(`/check-tenant/${query}`);
      if (response?.data?.exists) {
        router.push(`/login?tenant=${query}`);
      } else {
        throw new Error();
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        `Le Nexus Core ne détecte aucun écosystème rattaché à "${query}". Souhaitez-vous le propulser ?`;
      setAiMessage(message);
      setShowPopup(true);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a0a0f] font-sans text-white selection:bg-purple-500/30">
      {/* GRID */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-size-[40px_40px]" />

      {/* POPUP */}
      {showPopup && (
        <div className="animate-in fade-in slide-in-from-top-8 fixed top-6 left-1/2 z-50 w-[95%] max-w-lg -translate-x-1/2 px-2 duration-500">
          <div className="flex gap-4 rounded-3xl border border-purple-500/30 bg-[#111118]/90 p-5 shadow-xl backdrop-blur-xl">
            <div className="rounded-xl border border-purple-500/30 bg-purple-600/20 p-3">
              <Sparkles className="text-purple-400" size={20} />
            </div>

            <div className="flex-1">
              <p className="text-sm leading-relaxed text-slate-300 italic">
                "{aiMessage}"
              </p>

              <div className="mt-4 flex gap-3">
                <Link
                  href="/register"
                  className="rounded-xl bg-purple-600 px-4 py-2 text-xs transition hover:bg-purple-500"
                >
                  Propulser
                </Link>

                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs text-slate-400 transition hover:bg-slate-800"
                >
                  Ignorer
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowPopup(false)}
              className="text-slate-500 transition hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className="sticky top-0 z-40 border-b border-white/5 bg-[#0a0a0f]/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div
            onClick={() => router.push("/")}
            className="group flex cursor-pointer items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-purple-600 to-blue-600 shadow-lg shadow-purple-600/20 transition group-hover:scale-105">
              <Boxes size={20} />
            </div>

            <div>
              <span className="text-lg font-black">
                NEXUS<span className="text-purple-500">.OS</span>
              </span>
              <div className="text-[8px] tracking-widest text-slate-500 uppercase">
                Living Infrastructure
              </div>
            </div>
          </div>

          <Link
            href="/register"
            className="rounded-xl bg-purple-600 px-5 py-2 text-sm font-bold shadow-md transition hover:bg-purple-500"
          >
            Initialiser
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <header className="px-6 pt-24 pb-24 text-center">
        <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-[10px] font-bold tracking-widest text-purple-400 uppercase">
          <Zap size={12} /> EaaS Framework
        </div>

        <h1 className="mb-8 text-5xl leading-[0.9] font-black md:text-[90px]">
          L'Écosystème <br />
          <span className="bg-linear-to-b from-white via-slate-200 to-slate-500 bg-clip-text text-transparent">
            Vivant & Modulaire
          </span>
        </h1>

        <p className="mx-auto mb-14 max-w-2xl text-lg text-slate-300">
          Une infrastructure intelligente qui s’adapte à votre métier.
        </p>

        {/* SEARCH */}
        <form
          onSubmit={handleFindInstance}
          className="relative mx-auto max-w-xl"
        >
          <input
            value={searchTenant}
            onChange={(e) => setSearchTenant(e.target.value)}
            disabled={isVerifying}
            placeholder="Identifiant Nexus..."
            className="w-full rounded-2xl border border-white/10 bg-[#111118] p-6 pl-14 text-lg transition outline-none focus:border-purple-500 disabled:opacity-50"
          />

          <div className="absolute top-1/2 left-5 -translate-y-1/2">
            {isVerifying ? (
              <Loader2 className="animate-spin text-purple-500" size={22} />
            ) : (
              <Activity className="text-slate-500" size={22} />
            )}
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-xl bg-purple-600 p-3 transition hover:bg-purple-500 disabled:opacity-50"
          >
            <ChevronRight size={20} />
          </button>
        </form>
      </header>

      {/* FEATURES */}
      <section className="border-y border-white/5 bg-[#0f0f14] px-6 py-20">
        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<Cpu size={20} />}
            title="Intelligence EaaS"
            desc="Activation automatique des modules."
            tag="AI Driven"
          />
          <FeatureCard
            icon={<Layers size={20} />}
            title="Isolation Totale"
            desc="Environnements totalement séparés."
            tag="Secure"
          />
          <FeatureCard
            icon={<LayoutGrid size={20} />}
            title="Modulaire"
            desc="Ajout de modules sans friction."
            tag="Scalable"
          />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 text-center text-xs text-slate-500">
        © 2026 Nexus OS
      </footer>

      {/* AI */}
      <div className="relative z-50">
        <NexusPublicAssistant />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc, tag }: any) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#111118] p-8 transition hover:-translate-y-1 hover:border-purple-500/30">
      <div className="mb-4 text-purple-500">{icon}</div>
      <div className="mb-2 text-[10px] text-purple-400 uppercase">{tag}</div>
      <h3 className="mb-2 text-lg font-bold">{title}</h3>
      <p className="text-sm text-slate-400">{desc}</p>
    </div>
  );
}
