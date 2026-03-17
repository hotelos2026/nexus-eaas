import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://backend-nexus.up.railway.app/api',
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        // --- 1. RÉCUPÉRATION DU TENANT (IDENTITÉ INSTANCE) ---
        const urlParams = new URLSearchParams(window.location.search);
        let tenant = urlParams.get('tenant') || localStorage.getItem('current_tenant');

        // Détection automatique par sous-domaine si absent
        if (!tenant) {
            const hostname = window.location.hostname;
            const parts = hostname.split('.');
            if (parts.length > 2 && !['www', 'localhost', 'nexus-eaas'].includes(parts[0])) {
                tenant = parts[0];
            }
        }

        // Injection du header de l'instance
        if (tenant) {
            config.headers['X-Tenant'] = tenant;
            localStorage.setItem('current_tenant', tenant);
        }

        // --- 2. RÉCUPÉRATION DU TOKEN (IDENTITÉ UTILISATEUR) ---
        // Très important pour accéder aux routes protégées après le login
        const token = localStorage.getItem('nexus_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export default api;