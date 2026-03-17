'use client';

import { useState, Suspense, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import AiNotification from '@/components/AiNotification';

/**
 * Composant de formulaire de connexion Nexus OS
 * Authentification Multi-Tenant avec retours IA en temps réel
 */
function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    // État de la notification IA
    const [notif, setNotif] = useState({ 
        show: false, 
        msg: '', 
        type: 'ai' as 'ai' | 'error' | 'success' 
    });

    const router = useRouter();
    const searchParams = useSearchParams();
    const tenant = searchParams.get('tenant'); 

    // Fonction pour déclencher la popup IA
    const triggerAiNotif = (msg: string, type: 'ai' | 'error' | 'success') => {
        setNotif({ show: true, msg, type });
        // Auto-fermeture après 5 secondes sauf pour les erreurs critiques
        if (type !== 'error') {
            setTimeout(() => setNotif(prev => ({ ...prev, show: false })), 5000);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!tenant) {
            triggerAiNotif("Le Nexus Core ne détecte aucun identifiant d'instance dans l'URL.", "error");
            return;
        }

        setLoading(true);
        
        try {
            // Envoi des identifiants + tenant au backend
            const res = await api.post('/login', { 
                email, 
                password,
                tenant: tenant 
            });
            
            const token = res.data.access_token;
            
            // Notification de succès (le message vient de l'IA Python via Laravel)
            triggerAiNotif(res.data.message || "Accès autorisé. Initialisation du dashboard...", "success");

            localStorage.setItem('nexus_token', token);
            localStorage.setItem('current_tenant', tenant);

            // Redirection après un court délai pour laisser l'IA "parler"
            setTimeout(() => {
                router.push(`/dashboard?tenant=${tenant}`);
            }, 1800);
            
        } catch (err: any) {
            // Récupération du message d'erreur intelligent généré par Python
            const errorMsg = err.response?.data?.message || "Échec de liaison au secteur " + tenant;
            triggerAiNotif(errorMsg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white font-sans overflow-hidden">
            {/* Composant de Notification IA */}
            <AiNotification 
                isVisible={notif.show} 
                message={notif.msg} 
                type={notif.type} 
                onClose={() => setNotif(prev => ({ ...prev, show: false }))} 
            />

            {/* Ligne laser décorative supérieure */}
            <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
            
            <form 
                onSubmit={handleLogin} 
                className="relative p-8 border border-gray-800 rounded-2xl shadow-2xl w-96 bg-[#0a0a0a]/80 backdrop-blur-md z-10"
            >
                {/* Glow effect derrière le logo */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-32 h-32 bg-purple-600/10 blur-3xl rounded-full"></div>

                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-purple-600/10 rounded-xl border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                        <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-2xl font-bold mb-1 text-center bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent tracking-tight">
                    Nexus Login
                </h1>
                <p className="text-gray-500 text-[10px] text-center mb-8 uppercase tracking-[0.3em] font-bold">
                    Instance : <span className="text-purple-400">{tenant || 'Indéterminée'}</span>
                </p>
                
                <div className="space-y-5">
                    <div>
                        <label className="text-[10px] text-gray-500 ml-1 mb-1.5 block font-black tracking-widest">IDENTIFIANT SÉCURISÉ</label>
                        <input 
                            type="email" 
                            placeholder="votre@email.com" 
                            required
                            className="w-full p-3 bg-black border border-gray-800 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm placeholder:text-gray-700"
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                    </div>

                    <div>
                        <label className="text-[10px] text-gray-500 ml-1 mb-1.5 block font-black tracking-widest">CLEF D'ACCÈS</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            required
                            className="w-full p-3 bg-black border border-gray-800 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 transition-all text-sm placeholder:text-gray-700"
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                    </div>
                </div>
                
                <button 
                    disabled={loading || !tenant}
                    type="submit"
                    className="w-full mt-8 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest p-4 rounded-xl transition-all transform active:scale-[0.97] disabled:opacity-30 disabled:cursor-not-allowed shadow-xl shadow-purple-900/20 overflow-hidden relative group"
                >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Synchronisation...
                            </>
                        ) : 'Établir la connexion'}
                    </span>
                    {/* Effet de brillance au survol */}
                    <div className="absolute inset-0 w-full h-full bg-linear-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12"></div>
                </button>

                {!tenant && (
                    <div className="mt-6 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                        <p className="text-[10px] text-red-400 text-center font-bold tracking-tight">
                            ⚠️ ERREUR : TUNNEL D'INSTANCE NON DÉFINI
                        </p>
                    </div>
                )}
            </form>

            {/* Décoration d'arrière-plan */}
            <div className="absolute bottom-10 left-10 w-64 h-64 bg-purple-600/5 blur-[120px] rounded-full"></div>
            <div className="absolute top-10 right-10 w-64 h-64 bg-blue-600/5 blur-[120px] rounded-full"></div>

            <p className="mt-8 text-gray-700 text-[10px] tracking-[0.4em] font-black uppercase">
                Nexus OS Core &copy; 2026
            </p>
        </div>
    );
}

/**
 * Export avec Suspense pour la gestion des SearchParams (Next.js 13/14+)
 */
export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-[#050505]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                    <div className="text-purple-500 text-[10px] font-black tracking-[0.5em] uppercase animate-pulse">
                        Ouverture du tunnel...
                    </div>
                </div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}