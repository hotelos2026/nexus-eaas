'use client';

import { useState, Suspense, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import AiNotification from '@/components/AiNotification';
import {
  Mail,
  Lock,
  Loader2,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTenant, setActiveTenant] = useState<string | null>(null);

  const [notif, setNotif] = useState({
    show: false,
    msg: '',
    type: 'ai' as 'ai' | 'error' | 'success'
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  // --- LOGIQUE DE DÉTECTION DU TENANT ---
  // --- LOGIQUE DE DÉTECTION ET VALIDATION DU TENANT ---
useEffect(() => {
  const verifyAndSetTenant = async (slug: string) => {
    try {
      // On vérifie si le node existe VRAIMENT dans le Nexus (BDD)
      const res = await api.get(`/check-tenant/${slug}`);
      
      if (res.data.exists) {
        setActiveTenant(slug.toLowerCase());
        localStorage.setItem('current_tenant', slug.toLowerCase());
      }
    } catch (err) {
      // Si le backend répond 404, on invalide tout
      setActiveTenant(null);
      localStorage.removeItem('current_tenant');
      triggerAiNotif(`Le node [${slug}] est inconnu ou désactivé.`, "error");
    }
  };

  const queryTenant = searchParams.get('tenant');
  
  if (queryTenant) {
    verifyAndSetTenant(queryTenant);
  } else {
    // Détection par sous-domaine
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    if (parts.length > (hostname.includes('localhost') ? 1 : 2)) {
      const subdomain = parts[0];
      if (!['www', 'api', 'nexus-eaas', 'nexus'].includes(subdomain)) {
        verifyAndSetTenant(subdomain);
      }
    }
  }
}, [searchParams]);

  const isPasswordValid = password.length >= 8;

  const triggerAiNotif = (msg: string, type: 'ai' | 'error' | 'success') => {
    setNotif({ show: true, msg, type });
    if (type !== 'error') {
      setTimeout(() => setNotif(prev => ({ ...prev, show: false })), 4500);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeTenant) {
      triggerAiNotif("Instance Nexus introuvable. Identifiant d'instance requis.", "error");
      return;
    }

    setLoading(true);

    try {
      // L'appel utilise l'intercepteur de lib/api.js qui injecte X-Tenant
      const res = await api.post('/login', {
        email,
        password,
        tenant: activeTenant 
      });

      const token = res.data.access_token;

      triggerAiNotif(
        `Authentification réussie. Synchronisation avec ${activeTenant}...`,
        "success"
      );

      // Stockage des clés d'accès
      localStorage.setItem('nexus_token', token);
      localStorage.setItem('current_tenant', activeTenant);

      setTimeout(() => {
        router.push(`/dashboard?tenant=${activeTenant}`);
      }, 1200);

    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Échec de l'authentification Nexus";
      triggerAiNotif(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
      
      {/* EFFETS DE FOND DYNAMIQUES */}
      <div className="absolute w-[600px] h-[600px] bg-purple-600/20 blur-[120px] top-[-100px] left-[-100px] pointer-events-none animate-pulse" />
      <div className="absolute w-[500px] h-[500px] bg-blue-600/10 blur-[120px] bottom-[-100px] right-[-100px] pointer-events-none" />

      <AiNotification
        isVisible={notif.show}
        message={notif.msg}
        type={notif.type}
        onClose={() => setNotif(prev => ({ ...prev, show: false }))}
      />

      <div className="max-w-[420px] w-full relative z-10">
        <form
          onSubmit={handleLogin}
          className="bg-white/3 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] relative overflow-hidden"
        >
          {/* Grain de texture overlay */}
          <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />

          <div className="mb-10 text-center relative z-20">
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">
              NEXUS<span className="text-purple-500">OS</span>
            </h1>
            
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className={`h-1.5 w-1.5 rounded-full ${activeTenant ? 'bg-green-500 animate-ping' : 'bg-red-500'}`} />
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">
                Node: <span className="text-purple-400">{activeTenant ? `${activeTenant}.network` : 'OFFLINE'}</span>
              </p>
            </div>
          </div>

          <div className="space-y-4 relative z-20">
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={18} />
              <input
                type="email"
                required
                placeholder="Identifiant de l'agent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-700"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={18} />
              <input
                type="password"
                required
                placeholder="Clé de sécurité"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all placeholder:text-gray-700"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {isPasswordValid 
                  ? <ShieldCheck className="text-green-500/50" size={18} /> 
                  : <ShieldAlert className="text-orange-500/30" size={18} />
                }
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !activeTenant}
            className="group relative mt-8 w-full bg-white text-black font-black py-4 rounded-2xl uppercase tracking-widest text-xs hover:bg-purple-500 hover:text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Vérifier l'empreinte"}
            </span>
          </button>

          {!activeTenant && (
            <div className="mt-6 p-4 text-center bg-red-500/5 border border-red-500/20 rounded-2xl">
              <p className="text-[9px] text-red-400 uppercase leading-relaxed font-bold">
                Erreur critique : Aucune instance Nexus détectée via URL ou domaine.
              </p>
            </div>
          )}

          <div className="mt-10 pt-6 border-t border-white/5 flex justify-between items-center opacity-40">
            <p className="text-[8px] uppercase tracking-widest font-bold">Encrypted Node</p>
            <p className="text-[8px] uppercase tracking-widest font-bold text-purple-500">v2.0.4</p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" /></div>}>
      <LoginForm />
    </Suspense>
  );
}