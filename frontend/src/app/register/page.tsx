'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck, ShieldAlert, Building2,
  Mail, Lock, Globe, CheckCircle2, Loader2, Fingerprint, ChevronDown
} from 'lucide-react';

export default function RegisterSpace() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  const router = useRouter();

  const [formData, setFormData] = useState({
    company_name: '',
    tenant_slug: '',
    admin_name: 'Administrateur',
    admin_email: '',
    password: '',
    sector: '' // Sera initialisé par l'appel API
  });

  // --- LOGIQUE DE DÉTECTION AUTOMATIQUE DES SECTEURS ---
  useEffect(() => {
    async function fetchSectors() {
      try {
        // Cette route appelle ton ModuleDiscoveryService côté Backend
        const res = await api.get('/sectors'); 
        setAvailableSectors(res.data);
        if (res.data.length > 0) {
          setFormData(prev => ({ ...prev, sector: res.data[0] }));
        }
      } catch (err) {
        console.error("Impossible de synchroniser les secteurs métiers", err);
        setAvailableSectors(['general']); // Fallback au cas où
      }
    }
    fetchSectors();
  }, []);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.admin_email);
  const isPasswordValid = formData.password.length >= 8;
  const isSlugValid = /^[a-z0-9-]+$/.test(formData.tenant_slug) && formData.tenant_slug.length >= 3;

  const canGoToStep2 = formData.company_name.length >= 3 && isSlugValid && formData.sector !== '';
  const canSubmit = isEmailValid && isPasswordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Propulsion vers le moteur de provisioning EaaS
      const res = await api.post('/tenants/provision', formData);
      
      // Succès : Redirection vers le login de la nouvelle instance
      router.push(`/login?tenant=${res.data.tenant}`);
    } catch (err: any) {
      alert("Erreur de propulsion : " + (err.response?.data?.message || "Identifiant déjà utilisé."));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      
      {/* EFFETS VISUELS NEXUS */}
      <div className="absolute w-[600px] h-[600px] bg-purple-600/20 blur-[120px] top-[-100px] left-[-100px] pointer-events-none" />
      <div className="absolute w-[500px] h-[500px] bg-blue-600/10 blur-[120px] bottom-[-100px] right-[-100px] pointer-events-none" />

      <div className="max-w-[450px] w-full relative z-10">

        {/* INDICATEUR D'ÉTAPE */}
        <div className="flex items-center justify-between mb-10 px-2">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs transition-all duration-500
                ${step >= s 
                  ? 'bg-linear-to-br from-purple-600 to-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                  : 'bg-[#111] border border-white/10 text-gray-600'}`}>
                {step > s ? <CheckCircle2 size={16} /> : s}
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-widest ${step >= s ? 'text-white' : 'text-gray-600'}`}>
                {s === 1 ? "Organisation" : "Sécurité"}
              </span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="relative bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[40px] shadow-2xl overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

          {/* ÉTAPE 1 : INFRASTRUCTURE & MÉTIER */}
          {step === 1 && (
            <div className="relative z-20 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 uppercase tracking-tight">
                <Building2 className="text-purple-400" size={20} /> Nexus Finder
              </h2>

              <div className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Nom de l'entreprise"
                  className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-purple-500/50 transition-all"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                />

                <div className="relative">
                  <Fingerprint className="absolute left-4 top-4 text-gray-600" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="id-unique-instance"
                    className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-purple-500/50 transition-all"
                    value={formData.tenant_slug}
                    onChange={(e) => setFormData({ ...formData, tenant_slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  />
                </div>

                {/* SÉLECTEUR DE SECTEUR DYNAMIQUE */}
                <div className="relative">
                  <Globe className="absolute left-4 top-4 text-gray-600" size={18} />
                  <select
                    className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  >
                    <option value="" disabled>Sélectionner un secteur</option>
                    {availableSectors.map((sector) => (
                      <option key={sector} value={sector} className="bg-[#0f0f0f]">
                        Secteur : {sector}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-4 text-gray-600 pointer-events-none" size={18} />
                </div>
              </div>

              <button
                type="button"
                disabled={!canGoToStep2}
                onClick={() => setStep(2)}
                className="w-full mt-8 bg-white text-black font-bold p-4 rounded-2xl hover:bg-purple-500 hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          )}

          {/* ÉTAPE 2 : ACCÈS MAÎTRE */}
          {step === 2 && (
            <div className="relative z-20 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 uppercase tracking-tight">
                <Lock className="text-purple-400" size={20} /> Master Access
              </h2>

              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-4 text-gray-600" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="email@admin.com"
                    className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl outline-none focus:border-purple-500/50"
                    value={formData.admin_email}
                    onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                  />
                </div>

                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Mot de passe (8+ caractères)"
                    className="w-full bg-white/5 border border-white/10 p-4 rounded-2xl outline-none focus:border-purple-500/50"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <div className="absolute right-4 top-4">
                    {isPasswordValid ? <ShieldCheck className="text-green-400" size={20} /> : <ShieldAlert className="text-orange-400" size={20} />}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setStep(1)} className="flex-1 bg-white/5 border border-white/10 p-4 rounded-2xl hover:bg-white/10 transition-all">
                  Retour
                </button>
                <button 
                  type="submit" 
                  disabled={loading || !canSubmit}
                  className="flex-2 bg-purple-600 text-white font-bold p-4 rounded-2xl hover:bg-purple-500 transition-all flex justify-center items-center"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "Propulser"}
                </button>
              </div>
            </div>
          )}

          <p className="text-[9px] text-gray-600 mt-8 text-center uppercase tracking-[0.3em] font-bold opacity-50 relative z-20">
            Nexus Engine EaaS v2.0
          </p>
        </form>
      </div>
    </div>
  );
}