'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api'; // Ton instance Axios configurée avec X-Tenant
import { 
  BookOpen, Bus, Coffee, GraduationCap, Calculator, 
  ShieldCheck, CheckCircle2, Star, X, Smartphone,
  Zap, Bell, Globe, LayoutGrid, Loader2, Package
} from 'lucide-react';

// Système de mapping des icônes par nom ou catégorie
const iconMap: Record<string, any> = {
  'Academique': <GraduationCap size={20}/>,
  'Sante': <ShieldCheck size={20}/>,
  'Logistique': <Package size={20}/>,
  'Finance': <Calculator size={20}/>,
  'Default': <LayoutGrid size={20}/>
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const tenant = searchParams.get('tenant');

  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Tous');
  const [paymentStep, setPaymentStep] = useState(1);
  const [selectedOperator, setSelectedOperator] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // --- RÉCUPÉRATION RÉELLE DES MODULES VIA API ---
  useEffect(() => {
    async function loadModules() {
      try {
        setLoading(true);
        // Appelle la route : /api/nexus/modules (qui filtre par secteur côté Laravel)
        const res = await api.get('/nexus/modules');
        setModules(res.data.modules);
      } catch (err) {
        console.error("Erreur App Store:", err);
      } finally {
        setLoading(false);
      }
    }
    loadModules();
  }, []);

  const formatAr = (val: number) => new Intl.NumberFormat('fr-MG').format(val) + " Ar";

  // Filtrage des onglets basés sur les catégories réellement reçues
  const categories = ['Tous', ...Array.from(new Set(modules.map(m => m.category)))];

  if (loading) return <LoadingState />;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER DYNAMIQUE */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto scrollbar-hide">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveTab(cat)} 
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase whitespace-nowrap transition-all ${activeTab === cat ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="hidden sm:flex flex-col items-end text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase italic leading-none tracking-tighter">Nexus OS App Store</p>
          <p className="text-[8px] font-bold text-indigo-500 uppercase mt-1 tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
            Node: {tenant || 'Detecting...'}
          </p>
        </div>
      </div>

      <div className="p-6">
        {modules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                <Package size={48} className="mb-4 opacity-20" />
                <p className="font-black text-xs uppercase tracking-widest">Aucun module disponible pour ce secteur</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-5">
            {modules.filter(m => activeTab === 'Tous' || m.category === activeTab).map((mod, idx) => (
                <div key={idx} className="group relative bg-white border border-slate-200 rounded-[2.5rem] p-5 transition-all duration-300 hover:border-indigo-400 hover:shadow-2xl flex flex-col items-center">
                
                {/* Icône dynamique basée sur la catégorie */}
                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all duration-500">
                    {iconMap[mod.category] || iconMap['Default']}
                </div>

                <div className="text-center w-full min-w-0">
                    <h3 className="font-black text-[11px] text-slate-800 truncate px-1 uppercase leading-tight">{mod.name}</h3>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 opacity-60">{mod.category}</p>
                </div>
                
                <div className="w-full mt-4">
                    <button 
                        onClick={() => setSelectedModule(mod)}
                        className="w-full py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                    >
                        Explorer
                    </button>
                </div>
                </div>
            ))}
            </div>
        )}
      </div>

      {/* MODAL DE PAIEMENT (Simplifié pour le test) */}
      {selectedModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedModule(null)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95">
            <h2 className="text-xl font-black text-slate-900 uppercase">{selectedModule.name}</h2>
            <p className="text-slate-400 text-[10px] mb-6 font-bold uppercase tracking-widest">Secteur: {selectedModule.category}</p>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-6">
                <p className="text-xs text-slate-600 italic">Prêt pour l'installation sur votre instance {tenant}.</p>
            </div>
            <button onClick={() => setSelectedModule(null)} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase">Confirmer l'installation</button>
          </div>
        </div>
      )}
    </div>
  );
}

function LoadingState() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="animate-spin mb-4 text-indigo-500" size={32} />
            <p className="text-[10px] uppercase font-black tracking-[0.3em] animate-pulse">Chargement de l'App Store...</p>
        </div>
    );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <DashboardContent />
    </Suspense>
  );
}