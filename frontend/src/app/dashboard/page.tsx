'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import { 
  GraduationCap, Calculator, ShieldCheck, 
  CheckCircle2, X, Loader2, Package, ArrowLeft
} from 'lucide-react';

// 1. Mapping des icônes pour le menu
const iconMap: Record<string, any> = {
  'Academique': <GraduationCap size={20}/>,
  'Sante': <ShieldCheck size={20}/>,
  'Logistique': <Package size={20}/>,
  'Finance': <Calculator size={20}/>,
  'Shared': <Package size={20}/>,
  'Default': <Package size={20}/>
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const tenant = searchParams.get('tenant');

  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tous');
  
  // État pour le module actuellement ouvert
  const [activeModule, setActiveModule] = useState<any>(null);

  // --- CHARGEMENT DES MODULES DEPUIS LARAVEL ---
  useEffect(() => {
    async function loadModules() {
      try {
        setLoading(true);
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

  if (loading) return <LoadingState />;

  // --- VUE 1 : INTERFACE DU MODULE ACTIF ---
  if (activeModule) {
    // On importe dynamiquement le fichier index.tsx du dossier du module
    const ModuleInterface = dynamic(
      () => import(`@/modules/${activeModule.category}/${activeModule.name}/index`),
      { 
        loading: () => <LoadingState />,
        ssr: false 
      }
    );

    return (
      <div className="min-h-screen bg-white">
        {/* Barre de navigation interne au module */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-2xl">
          <button 
            onClick={() => setActiveModule(null)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft size={14} /> Quitter le module
          </button>
          <div className="flex flex-col items-center">
            <h2 className="text-xs font-black uppercase tracking-[0.3em]">{activeModule.name}</h2>
            <span className="text-[8px] opacity-50 font-bold uppercase">{activeModule.category}</span>
          </div>
          <div className="w-24 text-[8px] text-right font-bold text-slate-500 italic">
            Nexus OS / {tenant}
          </div>
        </div>

        {/* Zone d'affichage du module */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ModuleInterface />
        </div>
      </div>
    );
  }

  // --- VUE 2 : GRILLE DE L'APP STORE ---
  const categories = ['Tous', ...Array.from(new Set(modules.map(m => m.category)))];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* HEADER TABS */}
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
        <div className="hidden sm:flex flex-col items-end">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter italic">Nexus OS App Store</p>
          <p className="text-[8px] font-bold text-indigo-500 uppercase mt-1 tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100 italic">
            Node: {tenant}
          </p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-5">
          {modules
            .filter(m => activeTab === 'Tous' || m.category === activeTab)
            .map((mod, idx) => (
              <div key={idx} className="group relative bg-white border border-slate-200 rounded-[2.5rem] p-5 transition-all duration-300 hover:border-indigo-400 hover:shadow-2xl flex flex-col items-center">
                
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-500 group-hover:rotate-6 bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600`}>
                  {iconMap[mod.category] || iconMap['Default']}
                </div>

                <div className="text-center w-full">
                  <h3 className="font-black text-[11px] text-slate-800 truncate uppercase">{mod.name}</h3>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mt-1 opacity-60">{mod.category}</p>
                </div>
                
                <button 
                  onClick={() => setActiveModule(mod)}
                  className="w-full mt-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
                >
                  Explorer
                </button>
              </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- ÉTATS AUXILIAIRES ---
function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <Loader2 className="animate-spin mb-4 text-indigo-500" size={32} />
      <p className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-400 animate-pulse">Initialisation Nexus OS...</p>
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