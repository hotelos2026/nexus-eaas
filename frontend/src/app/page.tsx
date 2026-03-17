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
    if (query.length < 2) return;

    setIsVerifying(true);
    setShowPopup(false);

    try {
      const response = await api.get(`/check-tenant/${query}`);
      if (response.data.exists) {
        router.push(`/login?tenant=${query}`);
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 
                      `Le Nexus Core ne détecte aucun écosystème rattaché à "${query}". Souhaitez-vous le propulser ?`;
      setAiMessage(message);
      setShowPopup(true);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020203] text-white selection:bg-purple-500/30 font-sans overflow-x-hidden">
      
      {/* --- GRID BACKGROUND EFFECT (Tailwind v4 Optimized) --- */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* --- NEXUS AI INTELLIGENCE POPUP --- */}
      {showPopup && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-9999 w-[95%] max-w-lg animate-in fade-in slide-in-from-top-8 duration-500 px-2">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-purple-500/40 p-5 rounded-3xl shadow-[0_0_50px_rgba(147,51,234,0.25)] flex items-start gap-4">
            <div className="bg-purple-600/20 p-3 rounded-2xl shrink-0 border border-purple-500/30">
              <Sparkles className="text-purple-400" size={22} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Nexus Core Intelligence</span>
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></span>
              </div>
              <p className="text-slate-200 text-sm font-medium leading-relaxed italic">
                "{aiMessage}"
              </p>
              <div className="mt-5 flex items-center gap-3">
                <Link href="/register" className="text-[10px] text-white font-black uppercase tracking-widest bg-purple-600 px-5 py-2.5 rounded-xl hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20">
                    Propulser l'Ecosystème
                </Link>
                <button onClick={() => setShowPopup(false)} className="text-[10px] text-slate-400 font-bold uppercase tracking-widest border border-slate-700/50 px-5 py-2.5 rounded-xl hover:bg-slate-800 transition">
                    Ignorer
                </button>
              </div>
            </div>
            <button onClick={() => setShowPopup(false)} className="text-slate-500 hover:text-white transition p-1">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* --- NAVIGATION --- */}
      <nav className="sticky top-0 z-50 bg-[#020203]/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-600/20 group-hover:scale-105 transition-transform">
              <Boxes size={22} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter leading-none">NEXUS<span className="text-purple-500">.OS</span></span>
              <span className="text-slate-500 uppercase tracking-[0.3em] text-[8px] font-bold italic">Living Infrastructure</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-400">
            <Link href="#architecture" className="hover:text-purple-400 transition">Architecture</Link>
            <Link href="#modules" className="hover:text-purple-400 transition">Modules</Link>
            <Link href="#securite" className="hover:text-purple-400 transition">Sécurité</Link>
          </div>
          <Link href="/register" className="bg-white text-black px-6 py-2.5 rounded-xl hover:bg-purple-50 transition font-black text-[10px] uppercase tracking-widest shadow-xl shadow-white/5">
            Initialiser
          </Link>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-20 sm:pt-32 pb-24 px-6">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-10 text-[10px] font-black tracking-[0.3em] text-purple-400 uppercase bg-purple-500/10 border border-purple-500/20 rounded-full">
            <Zap size={12} className="fill-purple-400" /> Beyond SaaS : EaaS Framework
          </div>
          
          <h1 className="text-6xl md:text-[110px] font-black mb-8 tracking-[-0.04em] leading-[0.85] inline-block">
            L'Écosystème <br />
            <span className="text-transparent bg-clip-text bg-linear-to-b from-white via-slate-200 to-slate-500">
              Vivant & Modulaire.
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-slate-400 text-lg md:text-xl font-medium mb-14 leading-relaxed">
            Nexus n'est pas un logiciel figé. C'est une <span className="text-white">infrastructure EaaS intelligente</span> qui déploie des environnements isolés et s'auto-configure selon la sémantique de votre métier.
          </p>
          
          {/* --- SEARCH COMMAND CENTER --- */}
          <div className="max-w-2xl mx-auto mb-20 px-4 relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-purple-600 to-blue-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <form onSubmit={handleFindInstance} className="relative">
              <input 
                type="text" 
                disabled={isVerifying}
                placeholder="Saisissez votre Identifiant Nexus..."
                className="w-full bg-[#0d0d12] border border-white/10 p-6 sm:p-8 rounded-[2.2rem] outline-none focus:border-purple-500/50 transition-all text-xl pl-16 sm:pl-20 placeholder:text-slate-700 disabled:opacity-50 font-medium"
                value={searchTenant}
                onChange={(e) => setSearchTenant(e.target.value)}
              />
              <div className="absolute left-6 sm:left-8 top-1/2 -translate-y-1/2">
                {isVerifying ? 
                  <Loader2 className="animate-spin text-purple-500" size={28} /> : 
                  <Activity className="text-slate-600" size={28} />
                }
              </div>
              <button 
                type="submit"
                disabled={isVerifying}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white text-black hover:bg-purple-500 hover:text-white p-4 rounded-2xl transition-all duration-300"
              >
                <ChevronRight size={24} strokeWidth={3} />
              </button>
            </form>
            <div className="mt-4 text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] text-center">
              Authentification par Tunnel Sécurisé PostgreSQL Schema-Isolation
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.12)_0%,transparent_70%)] -z-10" />
      </header>

      {/* --- FEATURES GRID --- */}
      <section id="modules" className="py-24 px-6 bg-[#040406] border-y border-white/5 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Cpu size={24} />} 
              title="Intelligence EaaS" 
              desc="Contrairement au SaaS classique, Nexus analyse votre flux sémantique pour activer les modules ERP, CRM ou Santé de manière organique." 
              tag="Auto-Adaptive"
            />
            <FeatureCard 
              icon={<Layers size={24} />} 
              title="Infrastructure Isolée" 
              desc="Chaque identifiant Nexus correspond à une structure physique dédiée. Vos données ne croisent jamais celles d'un autre écosystème." 
              tag="Full Isolation"
            />
            <FeatureCard 
              icon={<LayoutGrid size={24} />} 
              title="Modulaire à l'Infini" 
              desc="Besoin d'un module de facturation ? D'une gestion de stock ? Activez les extensions sans jamais impacter la stabilité du cœur." 
              tag="Atomic Modules"
            />
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-16 px-6 text-center bg-[#020203]">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 opacity-30 grayscale hover:grayscale-0 transition duration-500">
             <Shield size={16} />
             <span className="text-xs font-black uppercase tracking-widest">Protocol Nexus-OS Secured v1.0.4</span>
          </div>
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">
            © 2026 Nexus Infrastructure Group — Tous droits réservés
          </p>
        </div>
      </footer>

      {/* --- SENTINEL AI REAL-TIME ASSISTANT --- */}
      <NexusPublicAssistant />

    </div>
  );
}

function FeatureCard({ icon, title, desc, tag }: { icon: React.ReactNode, title: string, desc: string, tag: string }) {
  return (
    <div className="group relative p-10 rounded-[3rem] bg-[#08080a] border border-white/5 hover:border-purple-500/30 transition-all duration-500">
      <div className="text-purple-500 mb-6 group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <div className="text-[9px] font-black text-purple-400 uppercase tracking-widest mb-2 opacity-60">
        {tag}
      </div>
      <h3 className="text-2xl font-black mb-4 tracking-tight">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed font-medium">
        {desc}
      </p>
    </div>
  );
}