'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import api from '@/lib/api';
import { 
  ArrowLeft, Loader2, CheckCircle2, ShoppingCart, Power
} from 'lucide-react';
import { DynamicIcon } from '@/components/DynamicIcon';

function DashboardContent() {
  const searchParams = useSearchParams();
  const tenant = searchParams.get('tenant');

  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tous');
  const [activeModule, setActiveModule] = useState<any>(null);

  const loadModules = async () => {
    try {
      setLoading(true);
      const res = await api.get('/nexus/modules', {
        headers: { 'X-Tenant': tenant || 'guest' }
      });
      // Le back doit renvoyer un objet où chaque module a un boolean 'is_subscribed'
      const data = Array.isArray(res.data) ? res.data : (res.data.modules || []);
      setModules(data);
    } catch (err) {
      console.error("Erreur App Store:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModules();
  }, [tenant]);

  // Action d'achat réelle vers le backend
  const handlePurchase = async (modId: string) => {
    try {
      await api.post(`/nexus/modules/${modId}/subscribe`, {}, {
        headers: { 'X-Tenant': tenant }
      });
      alert(`Module ${modId} activé avec succès !`);
      loadModules(); // On rafraîchit la liste pour mettre à jour les boutons
    } catch (err) {
      alert("Erreur lors de l'achat. Vérifiez votre solde.");
    }
  };

  if (loading) return <LoadingState />;

  if (activeModule) {
    const ModuleInterface = dynamic(
      () => import(`@/modules/${activeModule.category}/${activeModule.slug || activeModule.id}/index`),
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
          <div className="text-[8px] font-bold text-indigo-400 uppercase tracking-tighter italic">
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
            .map((mod, idx) => {
              // On utilise l'état venant du backend
              const isSubscribed = mod.is_subscribed === true;
              const finalPrice = mod.promo_price_per_month || mod.price_per_month || 0;

              return (
                <div key={idx} className={`group relative bg-white border ${isSubscribed ? 'border-emerald-100 shadow-sm' : 'border-slate-200'} rounded-[2.5rem] p-6 transition-all hover:border-indigo-400 hover:shadow-xl flex flex-col items-center text-center`}>
                  
                  {isSubscribed && (
                    <div className="absolute top-5 right-6 text-emerald-500">
                      <CheckCircle2 size={16} />
                    </div>
                  )}

                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg text-white"
                    style={{ backgroundColor: mod.color || '#6366f1' }}
                  >
                    <DynamicIcon name={mod.icon} size={28} />
                  </div>

                  <h3 className="font-black text-[11px] text-slate-800 uppercase leading-tight">{mod.name}</h3>
                  <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-3">{mod.category}</p>

                  <p className="text-[9px] text-slate-500 leading-relaxed mb-4 line-clamp-2">
                    {mod.description}
                  </p>

                  <div className="mt-auto w-full">
                    {!isSubscribed && (
                      <div className="flex flex-col items-center mb-4">
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm font-black text-slate-900">{Number(finalPrice).toLocaleString()}</span>
                          <span className="text-[8px] font-bold text-slate-400">Ar/Mois</span>
                        </div>
                      </div>
                    )}

                    {isSubscribed ? (
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => setActiveModule(mod)}
                          className="w-full py-3 bg-indigo-600 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                        >
                          <Power size={12} /> Activer
                        </button>
                        <button className="text-[8px] font-bold text-slate-300 uppercase hover:text-rose-500 transition-colors">
                          Désactiver
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handlePurchase(mod.id)}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
                      >
                        <ShoppingCart size={12} /> Acheter
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
      <Loader2 className="animate-spin mb-4 text-indigo-500" size={32} />
      <p className="text-[9px] uppercase font-black tracking-[0.3em] text-slate-400">Nexus Core Sync...</p>
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