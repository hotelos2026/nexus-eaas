import axios from 'axios';

/**
 * NEXUS OS - API ENGINE
 * Gestion centralisée de l'aiguillage multi-tenant et de l'authentification.
 */
const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://backend-nexus.up.railway.app/api',
    timeout: 15000, // Sécurité : 15s max pour éviter les requêtes fantômes
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

api.interceptors.request.use((config) => {
    // On s'assure d'être côté client (navigateur)
    if (typeof window !== 'undefined') {
        
        // --- 1. DÉTECTION DU NODE (TENANT) ---
        const urlParams = new URLSearchParams(window.location.search);
        let tenant = urlParams.get('tenant') || localStorage.getItem('current_tenant');

        // Détection intelligente par sous-domaine (ex: cyberdyne.nexus-os.app)
        if (!tenant) {
            const hostname = window.location.hostname;
            const parts = hostname.split('.');
            // Si on a un sous-domaine qui n'est pas un nom réservé
            if (parts.length > 2 && !['www', 'localhost', 'nexus-eaas', 'app'].includes(parts[0])) {
                tenant = parts[0];
            }
        }

        // --- 2. INJECTION DE L'IDENTITÉ INSTANCE ---
        if (tenant) {
            const cleanTenant = tenant.toLowerCase().trim();
            config.headers['X-Tenant'] = cleanTenant;
            
            // Optimisation : Mise à jour du storage uniquement si changement
            if (localStorage.getItem('current_tenant') !== cleanTenant) {
                localStorage.setItem('current_tenant', cleanTenant);
            }
        }

        // --- 3. INJECTION DU TOKEN DE SÉCURITÉ (USER AUTH) ---
        const token = localStorage.getItem('nexus_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

/**
 * INTERCEPTEUR DE RÉPONSE
 * Gère les erreurs globales comme le token expiré (401)
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Si l'utilisateur n'est plus autorisé, on nettoie le token 
            // mais on GARDE le tenant pour rester sur le bon login.
            localStorage.removeItem('nexus_token');
            if (window.location.pathname !== '/login') {
                window.location.href = `/login?tenant=${localStorage.getItem('current_tenant')}`;
            }
        }
        return Promise.reject(error);
    }
);

export default api;