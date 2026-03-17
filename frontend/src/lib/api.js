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
        // --- 1. GESTION DE L'AUTHENTIFICATION ---
        const token = localStorage.getItem('nexus_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // --- 2. GESTION DU MULTI-TENANCY ---
        const urlParams = new URLSearchParams(window.location.search);
        let tenant = urlParams.get('tenant');

        if (!tenant) {
            const hostname = window.location.hostname;
            const parts = hostname.split('.');
            if (parts.length > 2 && !['www', 'localhost', 'nexus-eaas'].includes(parts[0])) {
                tenant = parts[0];
            }
        }

        if (tenant) {
            config.headers['X-Tenant'] = tenant;
        }
    }
    return config;
});

export default api;