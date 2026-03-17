'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { 
    ShieldCheck, ShieldAlert, Rocket, Building2, 
    Mail, Lock, Globe, ChevronRight, ChevronLeft, 
    CheckCircle2, Loader2, Fingerprint
} from 'lucide-react';

export default function RegisterSpace() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    
    const [formData, setFormData] = useState({
        company_name: '',    // Nom complet (ex: Institut Supérieur Catholique du Menabe)
        tenant_slug: '',     // Identifiant court (ex: iscamen)
        admin_name: 'Administrateur',
        admin_email: '',
        password: '',
        sector: 'general'
    });

    // Validations logiques
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.admin_email);
    const isPasswordValid = formData.password.length >= 8;
    const isSlugValid = /^[a-z0-9-]+$/.test(formData.tenant_slug) && formData.tenant_slug.length >= 3;
    
    const canGoToStep2 = formData.company_name.length >= 3 && isSlugValid;
    const canSubmit = isEmailValid && isPasswordValid;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Expédition vers le Nexus EaaS Engine
            const res = await api.post('/tenants/provision', formData);
            router.push(`/login?tenant=${res.data.tenant}`);
        } catch (err: any) {
            alert("Erreur Système : " + (err.response?.data?.message || "Échec de propulsion Nexus."));
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 font-sans">
            <div className="max-w-[450px] w-full relative">
                
                {/* INDICATEUR DE PROGRESSION (TABS) */}
                <div className="flex items-center justify-between mb-8 px-2">
                    {[1, 2].map((s) => (
                        <div key={s} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs transition-all duration-500 ${step >= s ? 'bg-purple-600 shadow-[0_0_15px_rgba(147,51,234,0.5)]' : 'bg-gray-900 border border-gray-800 text-gray-600'}`}>
                                {step > s ? <CheckCircle2 size={16} /> : s}
                            </div>
                            <span className={`text-[10px] uppercase tracking-widest font-bold ${step >= s ? 'text-white' : 'text-gray-600'}`}>
                                {s === 1 ? "Organisation" : "Sécurité"}
                            </span>
                            {s === 1 && <div className={`w-12 h-[2px] mx-2 ${step > 1 ? 'bg-purple-600' : 'bg-gray-900'}`} />}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="bg-[#0f0f0f] border border-white/5 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    
                    {/* ÉTAPE 1 : IDENTITÉ DE L'ORGANISATION */}
                    {step === 1 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <header className="mb-8">
                                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                    <Building2 className="text-purple-500" /> L'Entité
                                </h2>
                                <p className="text-gray-500 text-xs mt-1">Configurez les paramètres d'identité de votre espace.</p>
                            </header>

                            <div className="space-y-5">
                                {/* NOM COMPLET */}
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 block px-1">Nom Officiel</label>
                                    <input 
                                        type="text"
                                        placeholder="Ex: Institut Supérieur Catholique..."
                                        className="w-full bg-black border border-gray-800 p-4 rounded-2xl focus:border-purple-600 outline-none transition-all text-sm"
                                        value={formData.company_name}
                                        onChange={e => setFormData({...formData, company_name: e.target.value})}
                                    />
                                </div>

                                {/* SLUG / IDENTIFIANT COURT */}
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 flex justify-between px-1">
                                        Identifiant Domaine
                                        <span className="text-purple-400 normal-case tracking-normal text-[9px]">iscamen, ispe, etc.</span>
                                    </label>
                                    <div className="relative">
                                        <Fingerprint className="absolute left-4 top-4 text-gray-700" size={18} />
                                        <input 
                                            type="text"
                                            placeholder="iscamen"
                                            className="w-full bg-black border border-gray-800 p-4 pl-12 rounded-2xl focus:border-purple-600 outline-none transition-all text-sm font-mono text-purple-400"
                                            value={formData.tenant_slug}
                                            onChange={e => setFormData({...formData, tenant_slug: e.target.value.toLowerCase().replace(/\s+/g, '')})}
                                        />
                                    </div>
                                    <p className="text-[9px] text-gray-600 mt-2 ml-1 italic">Accès futur : nexus-app.com/{formData.tenant_slug || 'nom'}</p>
                                </div>

                                {/* SECTEUR D'ACTIVITÉ */}
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2 block px-1">Secteur</label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-4 text-gray-700" size={18} />
                                        <select 
                                            className="w-full bg-black border border-gray-800 p-4 pl-12 rounded-2xl focus:border-purple-600 outline-none transition-all text-sm appearance-none cursor-pointer"
                                            value={formData.sector}
                                            onChange={e => setFormData({...formData, sector: e.target.value})}
                                        >
                                            <option value="general">💼 Services Généraux</option>
                                            <option value="immobilier">🏠 Immobilier / BTP</option>
                                            <option value="education">🎓 Éducation / École</option>
                                            <option value="sante">🏥 Santé / Hôpital</option>
                                            <option value="tech">💻 Technologie / IA</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="button"
                                disabled={!canGoToStep2}
                                onClick={() => setStep(2)}
                                className="w-full mt-10 bg-white text-black p-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-20 disabled:cursor-not-allowed"
                            >
                                Suivant <ChevronRight size={16} />
                            </button>
                        </div>
                    )}

                    {/* ÉTAPE 2 : ACCÈS MAÎTRE */}
                    {step === 2 && (
                        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                            <header className="mb-8">
                                <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                    <Lock className="text-purple-500" /> Sécurité
                                </h2>
                                <p className="text-gray-500 text-xs mt-1">Identifiants pour le compte administrateur maître.</p>
                            </header>

                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-3 block px-1">Email Administrateur</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-4 text-gray-600" size={18} />
                                        <input 
                                            type="email"
                                            placeholder="admin@domaine.mg"
                                            className="w-full bg-black border border-gray-800 p-4 pl-12 rounded-2xl focus:border-purple-600 outline-none transition-all text-sm"
                                            value={formData.admin_email}
                                            onChange={e => setFormData({...formData, admin_email: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-3 flex justify-between px-1">
                                        Mot de Passe <span>{formData.password.length}/8</span>
                                    </label>
                                    <div className="relative">
                                        <input 
                                            type="password"
                                            placeholder="••••••••"
                                            className="w-full bg-black border border-gray-800 p-4 rounded-2xl focus:border-purple-600 outline-none transition-all text-sm"
                                            onChange={e => setFormData({...formData, password: e.target.value})}
                                        />
                                        <div className="absolute right-4 top-4">
                                            {isPasswordValid ? <ShieldCheck className="text-green-500" size={20}/> : <ShieldAlert className="text-orange-500" size={20}/>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mt-10">
                                <button 
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-gray-800 text-gray-500 hover:bg-gray-900 transition flex items-center justify-center gap-2"
                                >
                                    <ChevronLeft size={14} /> Retour
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loading || !canSubmit}
                                    className="bg-purple-600 p-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-purple-500 transition shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : <><Rocket size={16} /> Propulser</>}
                                </button>
                            </div>
                        </div>
                    )}
                </form>

                <p className="text-[10px] text-gray-700 mt-8 text-center uppercase tracking-[0.2em] font-bold">
                    Nexus EaaS Engine — Multi-Tenant Architecture
                </p>
            </div>
        </div>
    );
}