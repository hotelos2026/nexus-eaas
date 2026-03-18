'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  LayoutGrid, ChevronRight, Layers,
  Sparkles, Loader2, X, Shield, Cpu,
  Boxes, Activity, Zap
} from 'lucide-react';
import NexusPublicAssistant from '@/components/NexusPublicAssistant';

export default function LandingPage() {
  const [searchTenant, setSearchTenant] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
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

    if (query === 'propulsion') {
      setIsVerifying(true);
      setTimeout(() => router.push('/register'), 800);
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
    <div className="min-h-screen bg-[#0a0a0f] text-white selection:bg-purple-500/30 font-sans overflow-x-hidden">

      {/* GRID */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none" />

      {/* POPUP */}
      {showPopup && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-lg animate-in fade-in slide-in-from-top-8 duration-500 px-2">
          <div className="bg-[#111118]/90 backdrop-blur-xl border border-purple-500/30 p-5 rounded-3xl shadow-xl flex gap-4">

            <div className="bg-purple-600/20 p-3 rounded-xl border border-purple-500/30">
              <Sparkles className="text-purple-400" size={20} />
            </div>

            <div className="flex-1">
              <p className="text-slate-300 text-sm italic leading-relaxed">
                "{aiMessage}"
              </p>

              <div className="mt-4 flex gap-3">
                <Link href="/register" className="text-xs bg-purple-600 px-4 py-2 rounded-xl hover:bg-purple-500 transition">
                  Propulser
                </Link>

                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className="text-xs text-slate-400 border border-slate-700 px-4 py-2 rounded-xl hover:bg-slate-800 transition"
                >
                  Ignorer
                </button>
              </div>
            </div>

            <button onClick={() => setShowPopup(false)} className="text-slate-500 hover:text-white transition">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* NAV */}
      <nav className="sticky top-0 z-40 bg-[#0a0a0f]/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

          <div onClick={() => router.push('/')} className="flex items-center gap-3 cursor-pointer group">
            <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20 group-hover:scale-105 transition">
              <Boxes size={20} />
            </div>

            <div>
              <span className="text-lg font-black">
                NEXUS<span className="text-purple-500">.OS</span>
              </span>
              <div className="text-[8px] text-slate-500 uppercase tracking-widest">
                Living Infrastructure
              </div>
            </div>
          </div>

          <Link href="/register" className="bg-purple-600 px-5 py-2 rounded-xl text-sm font-bold hover:bg-purple-500 transition shadow-md">
            Initialiser
          </Link>

        </div>
      </nav>

      {/* HERO */}
      <header className="pt-24 pb-24 px-6 text-center">

        <div className="inline-flex items-center gap-2 px-4 py-2 mb-10 text-[10px] font-bold tracking-widest text-purple-400 uppercase bg-purple-500/10 border border-purple-500/20 rounded-full">
          <Zap size={12} /> EaaS Framework
        </div>

        <h1 className="text-5xl md:text-[90px] font-black mb-8 leading-[0.9]">
          L'Écosystème <br />
          <span className="text-transparent bg-clip-text bg-linear-to-b from-white via-slate-200 to-slate-500">
            Vivant & Modulaire
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-300 mb-14 text-lg">
          Une infrastructure intelligente qui s’adapte à votre métier.
        </p>

        {/* SEARCH */}
        <form onSubmit={handleFindInstance} className="max-w-xl mx-auto relative">
          <input
            value={searchTenant}
            onChange={(e) => setSearchTenant(e.target.value)}
            disabled={isVerifying}
            placeholder="Identifiant Nexus..."
            className="w-full bg-[#111118] border border-white/10 p-6 pl-14 rounded-2xl text-lg focus:border-purple-500 outline-none transition disabled:opacity-50"
          />

          <div className="absolute left-5 top-1/2 -translate-y-1/2">
            {isVerifying
              ? <Loader2 className="animate-spin text-purple-500" size={22} />
              : <Activity className="text-slate-500" size={22} />}
          </div>

          <button
            type="submit"
            disabled={isVerifying}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-purple-600 p-3 rounded-xl hover:bg-purple-500 transition disabled:opacity-50"
          >
            <ChevronRight size={20} />
          </button>
        </form>

      </header>

      {/* FEATURES */}
      <section className="py-20 px-6 bg-[#0f0f14] border-y border-white/5">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-6">

          <FeatureCard icon={<Cpu size={20} />} title="Intelligence EaaS" desc="Activation automatique des modules." tag="AI Driven" />
          <FeatureCard icon={<Layers size={20} />} title="Isolation Totale" desc="Environnements totalement séparés." tag="Secure" />
          <FeatureCard icon={<LayoutGrid size={20} />} title="Modulaire" desc="Ajout de modules sans friction." tag="Scalable" />

        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 text-center text-slate-500 text-xs">
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
    <div className="p-8 rounded-2xl bg-[#111118] border border-white/5 hover:border-purple-500/30 transition hover:-translate-y-1">
      <div className="text-purple-500 mb-4">{icon}</div>
      <div className="text-[10px] text-purple-400 uppercase mb-2">{tag}</div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-slate-400 text-sm">{desc}</p>
    </div>
  );
}