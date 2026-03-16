import React from 'react';
import Link from 'next/link';
import { LayoutGrid, ShieldCheck, Zap, ChevronRight, LogIn, Globe, Layers } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-purple-500/30">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-2xl font-black tracking-tighter">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">N</div>
          NEXUS <span className="text-purple-500">OS</span>
        </div>
        <div className="flex items-center space-x-6 text-sm font-medium text-slate-400">
          <Link href="/login" className="hover:text-white transition flex items-center gap-2 border-r border-slate-800 pr-6">
            <LogIn size={18} />
            Connexion
          </Link>
          <Link href="/register" className="bg-white text-black px-6 py-2.5 rounded-full hover:bg-slate-200 transition font-bold shadow-lg shadow-white/10">
            Démarrer mon instance
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-24 pb-32 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-xs font-bold tracking-widest text-purple-400 uppercase bg-purple-400/10 border border-purple-400/20 rounded-full">
            <Globe size={14} /> Architecture Multi-Tenant Haute Performance
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-none">
            Votre Entreprise. <br />
            <span className="text-transparent bg-clip-text bg-linear-to-b from-slate-200 to-slate-500">
              Une Instance Unique.
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg md:text-2xl text-slate-400 mb-12 leading-relaxed">
            Nexus est l'OS modulaire pour entreprises modernes. Installez vos modules métier en un clic dans un environnement 100% isolé grâce à notre technologie de <span className="text-white font-semibold">Smart Schemas</span>.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/register" className="group px-10 py-5 bg-purple-600 rounded-2xl font-black text-xl hover:bg-purple-500 transition-all shadow-2xl shadow-purple-600/30 flex items-center gap-3">
              Créer mon espace <ChevronRight className="group-hover:translate-x-1 transition" size={24} />
            </Link>
          </div>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-purple-900/20 via-transparent to-transparent z-0" />
      </header>

      {/* Concept Section */}
      <section className="py-24 px-8 border-y border-slate-900 bg-slate-950/50">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="relative group p-10 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-purple-500/50 transition-all">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 text-purple-500">
              <Layers size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Isolation Totale</h3>
            <p className="text-slate-400 leading-relaxed text-lg">Chaque entreprise bénéficie de son propre schéma de base de données. Vos données sont physiquement séparées pour une sécurité absolue.</p>
          </div>

          <div className="relative group p-10 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-purple-500/50 transition-all">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 text-purple-500">
              <LayoutGrid size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Écosystème Modulaire</h3>
            <p className="text-slate-400 leading-relaxed text-lg">CRM, Gestion, IA, Finance... Activez uniquement les "Apps" dont vous avez besoin. Nexus s'adapte à votre croissance, pas l'inverse.</p>
          </div>

          <div className="relative group p-10 rounded-3xl bg-slate-900/40 border border-slate-800 hover:border-purple-500/50 transition-all">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-6 text-purple-500">
              <Zap size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-4">Fast App Deployment</h3>
            <p className="text-slate-400 leading-relaxed text-lg">Déployez votre instance métier en moins de 30 secondes. Une expérience fluide, inspirée des meilleurs standards Cloud.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-8 text-center max-w-4xl mx-auto">
        <h2 className="text-4xl font-bold mb-6">Prêt à digitaliser votre structure ?</h2>
        <p className="text-slate-400 mb-10 text-xl">Rejoignez la nouvelle vague d'entreprises qui utilisent Nexus OS pour centraliser leur intelligence métier.</p>
        <Link href="/register" className="inline-block px-8 py-4 border border-slate-700 rounded-full font-bold hover:bg-slate-900 transition text-lg">
          Parler à un expert Nexus
        </Link>
      </section>
    </div>
  );
}