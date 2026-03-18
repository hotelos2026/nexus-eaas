'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import { 
  ArrowLeft, Loader2
} from 'lucide-react';
import { DynamicIcon } from '@/components/DynamicIcon';

function DashboardContent() {
  const searchParams = useSearchParams();
  const tenant = searchParams.get('tenant');

  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tous');
  const [activeModule, setActiveModule] = useState<any>(null);

  useEffect(() => {
    async function loadModules() {
      try {
        setLoading(true);
        const res = await api.get('/nexus/modules', {
          headers: { 'X-Tenant': tenant || 'guest' }
        });
        const data = Array.isArray(res.data) ? res.data : (res.data.modules || []);
        setModules(data);
      } catch (err) {
        console.error("Erreur App Store:", err);
      } finally {
        setLoading(false);
      }
    }
    loadModules();
  }, [tenant]);

  if (loading) return <LoadingState />;

  if (activeModule) {
    const ModuleInterface = dynamic(
      () => import(`@/modules/${activeModule.category}/${activeModule.slug}/index`),
      { loading: () => <LoadingState />, ssr: false }
    );

    return (
      <div className="min-h-screen bg-white">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-2xl">
          <button 
            onClick={() => setActiveModule(null)}
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft size={14} /> Quitter
          </button>
          <div className="text-center">
            <h2 className="text-xs font-black uppercase tracking-[0.2em]">{activeModule.name}</h2>
            <span className="text-[7px] opacity-50 font-bold uppercase">{activeModule.category}</span>
          </div>
          <div className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">
            {tenant} @ Nexus
          </div>
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ModuleInterface />
        </div>
      </div>
    );
  }

  const categories = ['Tous', ...Array.from(new Set(modules.map(m => m.category)))];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto scrollbar-hide">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveTab(cat)} 
              className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${activeTab === cat ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {modules
            .filter(m => activeTab === 'Tous' || m.category === activeTab)
            .map((mod, idx) => (
              <div key={idx} className="group relative bg-white border border-slate-200 rounded-[2.5rem] p-6 transition-all hover:border-indigo-400 hover:shadow-xl flex flex-col items-center text-center">
                
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg text-white"
                  style={{ backgroundColor: mod.color || '#6366f1' }}
                >
                  <DynamicIcon name={mod.icon} size={28} />
                </div>

                <h3 className="font-black text-[11px] text-slate-800 uppercase">{mod.name}</h3>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-2">{mod.category}</p>

                <p className="text-[9px] text-slate-500 leading-relaxed mb-4 line-clamp-2 px-2">
                  {mod.description || "Aucune description disponible."}
                </p>

                <div className="mt-auto w-full">
                  <div className="flex flex-col items-center mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-black text-slate-900">
                        {Number(mod.promo_price_per_month || mod.price_per_month || 0).toLocaleString()}
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Ar/Mois</span>
                    </div>
                    
                    {mod.promo_price_per_month && (
                      <span className="text-[8px] text-rose-400 line-through font-bold">
                        {Number(mod.price_per_month).toLocaleString()} Ar
                      </span>
                    )}
                  </div>

                  <button 
                    onClick={() => setActiveModule(mod)}
                    className="w-full py-3 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
                  >
                    Explorer
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <Loader2 className="animate-spin mb-4 text-indigo-500" size={32} />
      <p className="text-[9px] uppercase font-black tracking-[0.3em] text-slate-400">Syncing Nexus Modules...</p>
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