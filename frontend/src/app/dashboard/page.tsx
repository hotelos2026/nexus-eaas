'use client';

import { useEffect, useState, Suspense } from 'react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { Rocket, Bot, Database, CheckCircle, LogOut, User, ShieldCheck } from 'lucide-react';

function DashboardContent() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Récupération du tenant depuis l'URL ou le localStorage
    const tenant = searchParams.get('tenant') || typeof window !== 'undefined' ? localStorage.getItem('current_tenant') : null;

    useEffect(() => {
        const token = localStorage.getItem('nexus_token');

        // Sécurité : redirection si pas de session
        if (!token) {
            router.push(`/login?tenant=${tenant || ''}`);
            return;
        }

        const fetchData = async () => {
            try {
                // L'intercepteur de src/lib/api.ts s'occupe du X-Tenant et du Bearer Token
                const response = await api.get('/test-ai');
                setData(response.data);
            } catch (error) {
                console.error("Erreur de connexion au Backend", error);
                // Si le token est expiré ou invalide (401)
                localStorage.removeItem('nexus_token');
                router.push(`/login?tenant=${tenant}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router, tenant]);

    const handleLogout = () => {
        localStorage.removeItem('nexus_token');
        router.push(`/login?tenant=${tenant}`);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                <p className="text-gray-400 animate-pulse">Synchronisation avec l'instance {tenant}...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans">
            {/* Barre de navigation supérieure */}
            <nav className="border-b border-gray-800 bg-[#0a0a0a]/50 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Rocket className="text-purple-500" size={24} />
                        <span className="font-bold text-xl tracking-tight">NEXUS <span className="text-purple-500 text-xs font-mono">v1.0</span></span>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-xs font-medium">
                            <CheckCircle size={14} /> Système Connecté
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-8">
                {/* Header Section */}
                <div className="mb-10">
                    <h2 className="text-3xl font-bold bg-linear-to-r from-white to-gray-500 bg-clip-text text-transparent mb-2">
                        Bienvenue dans votre Dashboard
                    </h2>
                    <p className="text-gray-500">
                        Gestionnaire multi-instance pour le domaine : <span className="text-purple-400 font-mono">{tenant}</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Carte Instance BDD */}
                    <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-gray-800 hover:border-purple-500/50 transition-all group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                                <Database className="text-purple-500" size={20} />
                            </div>
                            <h3 className="font-semibold text-gray-200">Base de Données</h3>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Schéma Actif</p>
                            <div className="flex items-center gap-2">
                                <code className="text-purple-400 font-mono text-sm bg-purple-500/5 px-2 py-1 rounded">
                                    {data?.instance || "tenant_default"}
                                </code>
                                <ShieldCheck size={14} className="text-green-500" />
                            </div>
                        </div>
                    </div>

                    {/* Carte Service IA */}
                    <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-gray-800 hover:border-orange-500/50 transition-all group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-orange-500/10 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                                <Bot className="text-orange-500" size={20} />
                            </div>
                            <h3 className="font-semibold text-gray-200">Statut Nexus AI</h3>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Latence Service</p>
                            <p className="text-sm text-gray-300 italic">
                                "{data?.ai_response?.status || "Service hors-ligne"}"
                            </p>
                        </div>
                    </div>

                    {/* Carte Profil */}
                    <div className="bg-[#0a0a0a] p-6 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-all group">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                                <User className="text-blue-500" size={20} />
                            </div>
                            <h3 className="font-semibold text-gray-200">Session</h3>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 uppercase tracking-widest">Connecté en tant que</p>
                            <p className="text-sm text-gray-300 font-medium">Administrateur</p>
                        </div>
                    </div>
                </div>

                {/* Bannière d'information */}
                <div className="mt-8 p-6 bg-linear-to-br from-purple-900/40 to-blue-900/40 border border-purple-500/20 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                        <Rocket size={80} />
                    </div>
                    <h3 className="font-bold mb-2 text-white flex items-center gap-2">
                        Prêt pour le déploiement
                    </h3>
                    <p className="text-sm text-gray-300 max-w-2xl leading-relaxed">
                        Votre architecture **Multi-Tenant** est opérationnelle. Le serveur Backend identifie 
                        automatiquement l'organisation grâce au header `X-Tenant` et isole les données dans 
                        le schéma PostgreSQL correspondant.
                    </p>
                </div>
            </main>
        </div>
    );
}

// Export final avec Suspense pour Next.js
export default function Dashboard() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
            <DashboardContent />
        </Suspense>
    );
}