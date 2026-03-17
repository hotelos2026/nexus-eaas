'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
  LayoutGrid, Zap, ChevronRight, Globe, Layers, 
  Search, Sparkles, Loader2, X, Shield, Cpu, 
  BarChart3, Boxes 
} from 'lucide-react';

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
                      `Nexus ne détecte aucune instance active pour "${query}".`;
      setAiMessage(message);
      setShowPopup(true);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020203] text-white selection:bg-purple-500/30 font-sans overflow-x-hidden">
      
      {/* --- NEXUS AI INTELLIGENCE OVERLAY --- */}
      {showPopup && (
        <div className="fixed top-4 sm:top-8 left-1/2 -translate-x-1/2 z-100 w-[95%] max-w-lg animate-in fade-in slide-in-from-top-8 duration-700 px-2">
          <div className="bg-slate-900/80 backdrop-blur-2xl border border-purple-500/40 p-4 sm:p-6 rounded-3xl shadow-[0_0_50px_rgba(147,51,234,0.3)] flex items-start gap-4">
            <div className="bg-purple-600/20 p-3 rounded-2xl shrink-0 border border-purple-500/20">
              <Sparkles className="text-purple-400" size={24} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Nexus IA Core</span>
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping"></span>
              </div>
              <p className="text-slate-200 text-sm sm:text-base font-medium leading-relaxed italic">
                "{aiMessage}"
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/register" className="text-[11px] text-white font-black uppercase tracking-widest bg-purple-600 px-5 py-2.5 rounded-xl hover:bg-purple-500 transition-all shadow-lg shadow-purple-600/20">
                   Provisionner l'Espace
                </Link>
                <button onClick={() => setShowPopup(false)} className="text-[11px] text-slate-400 font-bold uppercase tracking-widest border border-slate-700 px-5 py-2.5 rounded-xl hover:bg-slate-800 transition">
                   Ignorer
                </button>
              </div>
            </div>
            <button onClick={() => setShowPopup(false)} className="text-slate-500 hover:text-white transition p-1">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* --- NAVIGATION --- */}
      <nav className="sticky top-0 z-60 bg-[#020203]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-10 h-10 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/30 group-hover:rotate-12 transition-transform">
              <Boxes size={22} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter leading-none">NEXUS</span>
              <span className="text-purple-500 uppercase tracking-[0.3em] text-[9px] font-black">EaaS Ecosystem</span>
            </div>
          </div>
          <Link href="/register" className="hidden sm:block bg-white text-black px-6 py-2.5 rounded-2xl hover:bg-slate-200 transition font-black text-xs uppercase tracking-widest shadow-xl shadow-white/5">
            Lancer l'Ecosystème
          </Link>
          <button className="sm:hidden text-white"><LayoutGrid size={24} /></button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-16 sm:pt-28 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-[10px] font-black tracking-[0.3em] text-purple-400 uppercase bg-purple-500/5 border border-purple-500/20 rounded-full animate-fade-in">
            <Shield size={12} /> Infrastructure B2B Multi-Tenant
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9] lg:px-20">
            L'Ecosystème qui <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-linear-to-b from-white via-white to-slate-600">pense votre métier.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-slate-400 text-base sm:text-xl font-medium mb-12 px-4">
            Plus qu'un SaaS, Nexus est une infrastructure modulaire isolée. 
            Activez vos modules CRM, ERP ou Santé en un clic.
          </p>
          
          <div className="max-w-xl mx-auto mb-16 px-2 relative group">
            <form onSubmit={handleFindInstance} className="relative shadow-2xl shadow-purple-900/10">
              <input 
                type="text" 
                disabled={isVerifying}
                placeholder="Entrez le nom de votre instance..."
                className="w-full bg-slate-900/30 border-2 border-slate-800 p-5 sm:p-7 rounded-4xl outline-none focus:border-purple-600 transition-all text-lg pl-14 sm:pl-16 disabled:opacity-50"
                value={searchTenant}
                onChange={(e) => setSearchTenant(e.target.value)}
              />
              <div className="absolute left-5 sm:left-7 top-1/2 -translate-y-1/2">
                {isVerifying ? <Loader2 className="animate-spin text-purple-500" size={24} /> : <Search className="text-slate-600" size={24} />}
              </div>
              <button 
                type="submit"
                disabled={isVerifying}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 bg-purple-600 hover:bg-purple-500 p-3 sm:p-4 rounded-2xl transition-all shadow-xl shadow-purple-600/30"
              >
                <ChevronRight size={24} />
              </button>
            </form>
          </div>
        </div>
        
        {/* Background Visual Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.15)_0%,transparent_70%)] z-0 pointer-events-none" />
      </header>

      {/* --- PROFESSIONAL FEATURE GRID --- */}
      <section className="py-24 px-6 relative z-10 border-t border-white/5 bg-[#030305]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<Layers size={22} />} 
              title="Smart Schema" 
              desc="Isolation physique PostgreSQL. Chaque client possède sa propre structure de données." 
            />
            <FeatureCard 
              icon={<Cpu size={22} />} 
              title="Cœur IA Nexus" 
              desc="Analyse sémantique en temps réel pour prédire vos besoins métier et configurer l'interface." 
            />
            <FeatureCard 
              icon={<Boxes size={22} />} 
              title="Modularité Totale" 
              desc="Architecture EaaS : ajoutez des fonctionnalités sans toucher à la base de code centrale." 
            />
            <FeatureCard 
              icon={<BarChart3 size={22} />} 
              title="BI Native" 
              desc="Analytique avancée intégrée à chaque instance pour un pilotage précis de votre activité." 
            />
          </div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 opacity-50 hover:opacity-100 transition">
          <div className="flex items-center gap-2 text-sm font-bold tracking-tighter uppercase">
            Nexus Operating System v1.0.0 — 2026
          </div>
          <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
            <Link href="#">Infrastructure</Link>
            <Link href="#">Sécurité</Link>
            <Link href="#">Contact Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-[2.5rem] bg-[#09090b] border border-white/5 hover:border-purple-500/30 transition-all duration-500 group relative overflow-hidden">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-600/5 rounded-full blur-2xl group-hover:bg-purple-600/10 transition-all"></div>
      <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 text-purple-500 border border-purple-500/10 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-500 shadow-lg shadow-purple-600/0 group-hover:shadow-purple-600/20">
        {icon}
      </div>
      <h3 className="text-xl font-black mb-3 tracking-tight">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed font-medium">
        {desc}
      </p>
    </div>
  );
}