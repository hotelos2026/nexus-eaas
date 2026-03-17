'use client';

import { useState, Suspense } from 'react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

/**
 * Composant de formulaire de connexion
 * Gère l'authentification Multi-Tenant via Laravel Sanctum
 */
function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const router = useRouter();
    const searchParams = useSearchParams();
    
    // Récupère le nom du tenant depuis l'URL (ex: ?tenant=test-prod)
    const tenant = searchParams.get('tenant'); 

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!tenant) {
            alert("Erreur : Aucun tenant spécifié. Veuillez accéder via votre URL personnalisée.");
            return;
        }

        setLoading(true);
        
        try {
            // L'intercepteur dans lib/api.ts ajoute automatiquement le header 'X-Tenant'
            const res = await api.post('/login', { email, password });
            
            // 1. On récupère le Token Bearer renvoyé par le backend
            const token = res.data.access_token;
            
            // 2. Stockage persistant pour les futures requêtes API
            localStorage.setItem('nexus_token', token);
            localStorage.setItem('current_tenant', tenant);

            // 3. Redirection vers le dashboard avec le paramètre tenant pour l'UI
            router.push(`/dashboard?tenant=${tenant}`);
            
        } catch (err: any) {
            // Gestion des erreurs (401, 500, etc.)
            const errorMsg = err.response?.data?.message || err.response?.data?.details || 'Identifiants incorrects';
            alert('Erreur de connexion : ' + errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white font-sans">
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>
            
            <form 
                onSubmit={handleLogin} 
                className="p-8 border border-gray-800 rounded-2xl shadow-2xl w-96 bg-[#0a0a0a] backdrop-blur-sm"
            >
                <div className="flex justify-center mb-6">
                    <div className="p-3 bg-purple-600/10 rounded-xl border border-purple-500/20">
                        <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-2xl font-bold mb-1 text-center bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Nexus Login
                </h1>
                <p className="text-gray-500 text-sm text-center mb-8 uppercase tracking-widest font-medium">
                    Instance : <span className="text-purple-400">{tenant || 'Non définie'}</span>
                </p>
                
                <div className="space-y-4">
                    <div>
                        <label className="text-xs text-gray-500 ml-1 mb-1 block">EMAIL</label>
                        <input 
                            type="email" 
                            placeholder="votre@email.com" 
                            required
                            className="w-full p-3 bg-black border border-gray-800 rounded-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 ml-1 mb-1 block">MOT DE PASSE</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            required
                            className="w-full p-3 bg-black border border-gray-800 rounded-lg outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-sm"
                            onChange={(e) => setPassword(e.target.value)} 
                        />
                    </div>
                </div>
                
                <button 
                    disabled={loading || !tenant}
                    type="submit"
                    className="w-full mt-8 bg-purple-600 hover:bg-purple-700 text-white font-bold p-3 rounded-lg transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20"
                >
                    {loading ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Identification...
                        </span>
                    ) : 'Accéder à l\'instance'}
                </button>

                {!tenant && (
                    <p className="mt-4 text-xs text-red-500 text-center">
                        ⚠️ Lien d'instance manquant.
                    </p>
                )}
            </form>

            <p className="mt-8 text-gray-600 text-xs">
                &copy; 2026 Nexus Multi-Tenant Architecture. Tous droits réservés.
            </p>
        </div>
    );
}

/**
 * Page d'export avec Suspense requis par Next.js
 * pour l'utilisation de useSearchParams
 */
export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen bg-black text-white">
                <div className="animate-pulse text-purple-500 font-medium">Initialisation du tunnel...</div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}