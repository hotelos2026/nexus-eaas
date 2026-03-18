'use client';

import { useState, Suspense } from 'react';
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

  const [notif, setNotif] = useState({
    show: false,
    msg: '',
    type: 'ai' as 'ai' | 'error' | 'success'
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const tenant = searchParams.get('tenant'); // Récupère "apple" ou "spacex" depuis l'URL

  const isPasswordValid = password.length >= 8;

  const triggerAiNotif = (msg: string, type: 'ai' | 'error' | 'success') => {
    setNotif({ show: true, msg, type });
    if (type !== 'error') {
      setTimeout(() => setNotif(prev => ({ ...prev, show: false })), 4500);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenant) {
      triggerAiNotif("Aucune instance détectée dans l'URL.", "error");
      return;
    }

    setLoading(true);

    try {
      // On envoie le tenant pour que le Back sache quel schéma PostgreSQL ouvrir
      const res = await api.post('/login', {
        email,
        password,
        tenant: tenant.toLowerCase() 
      });

      const token = res.data.access_token;

      triggerAiNotif(
        res.data.message || `Accès autorisé à l'instance ${tenant}`,
        "success"
      );

      // Stockage local pour les futures requêtes API
      localStorage.setItem('nexus_token', token);
      localStorage.setItem('current_tenant', tenant);

      setTimeout(() => {
        router.push(`/dashboard?tenant=${tenant}`);
      }, 1200);

    } catch (err: any) {
      // On affiche le message d'erreur précis du Backend (ex: "Identifiants invalides")
      triggerAiNotif(
        err.response?.data?.message || "Échec de l'authentification Nexus",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">

      {/* BACKGROUND */}
      <div className="absolute w-[600px] h-[600px] bg-purple-600/20 blur-[120px] top-[-100px] left-[-100px] pointer-events-none" />
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
          className="bg-white/3 backdrop-blur-xl border border-white/10 p-8 sm:p-10 rounded-4xl shadow-[0_0_60px_rgba(0,0,0,0.6)] relative overflow-hidden"
        >

          {/* 🔥 FIX : pointer-events-none ajouté ici pour débloquer le clic sur les inputs */}
          <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />

          <div className="mb-8 text-center relative z-20">
            <h1 className="text-2xl font-black tracking-tight uppercase">
              Nexus OS <span className="text-purple-500">Login</span>
            </h1>

            <p className="text-[10px] text-gray-500 mt-2 uppercase tracking-widest font-bold">
              Domaine : 
              <span className="text-purple-400 ml-1">
                {tenant ? `${tenant}.nexus.app` : 'non spécifié'}
              </span>
            </p>
          </div>

          <div className="space-y-5 relative z-20">
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-gray-600" size={18} />
              <input
                type="email"
                required
                placeholder="admin@organisation.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-premium pl-12 relative z-30"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray-600" size={18} />
              <input
                type="password"
                required
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-premium pl-12 relative z-30"
              />

              <div className="absolute right-4 top-4 z-30">
                {isPasswordValid
                  ? <ShieldCheck className="text-green-400" size={20} />
                  : <ShieldAlert className="text-orange-400" size={20} />
                }
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !tenant}
            className="btn-primary mt-8 w-full relative z-20 cursor-pointer"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : "Vérifier l'empreinte"}
          </button>

          {!tenant && (
            <div className="mt-5 p-3 text-center text-[10px] text-red-400 border border-red-500/20 rounded-xl animate-pulse">
              Attention : Accès direct impossible sans identifiant d'instance.
            </div>
          )}

          <p className="text-[9px] text-gray-600 mt-8 text-center uppercase tracking-[0.3em] font-bold opacity-50">
            End-to-End Encrypted Node
          </p>

        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
      <LoginForm />
    </Suspense>
  );
}