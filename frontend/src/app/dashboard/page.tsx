'use client';

import { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { 
  Loader2, CheckCircle2, ShoppingCart, X, 
  ShieldCheck, Trash2, Info, Sparkles, Search, LayoutGrid 
} from 'lucide-react';
import { DynamicIcon } from '@/components/DynamicIcon';
import { useHeader } from '@/context/HeaderContext';

// REGISTRE DYNAMIQUE
import GestionStockModule from '@/modules/Logistique/GestionStock';

const MODULE_REGISTRY: Record<string, React.ComponentType<{ tenant: string | null }>> = {
  "Inventaire & Stock": GestionStockModule,
};

interface Module {
  id: string; 
  name: string; 
  category: string; 
  description: string;
  price_per_month: number; 
  promo_price_per_month?: number; 
  color: string; 
  icon: string; 
  is_subscribed: boolean;
}

function CartDrawer({ cart, onRemove, onClose, onCheckout, loading }: any) {
  const total = cart.reduce((acc: number, item: Module) => acc + (item.promo_price_per_month || item.price_per_month), 0);
  
  return (
    <div className="fixed inset-0 z-100 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative bg-white w-[350px] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-black text-slate-900 uppercase italic">Mon Panier Nexus</h2>
            <p className="text-[9px] text-slate-400 font-bold">{cart.length} module(s) sélectionné(s)</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-2">
              <ShoppingCart size={32} />
              <p className="text-[9px] font-black uppercase tracking-tighter">Votre panier est vide</p>
            </div>
          ) : (
            cart.map((item: Module) => (
              <div key={item.id} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 group">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm" style={{ backgroundColor: item.color }}>
                  <DynamicIcon name={item.icon} size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-[9px] font-black uppercase italic truncate">{item.name}</h4>
                  <p className="text-[9px] font-bold text-indigo-600">{(item.promo_price_per_month || item.price_per_month).toLocaleString()} Ar</p>
                </div>
                <button onClick={() => onRemove(item.id)} className="text-slate-300 hover:text-rose-500 p-1 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-100 bg-slate-50/50">
            <div className="flex justify-between items-end mb-4">
              <span className="text-[9px] font-black text-slate-400 uppercase">Total Mensuel</span>
              <span className="text-lg font-black text-slate-900">{total.toLocaleString()} Ar</span>
            </div>
            <button onClick={onCheckout} disabled={loading} className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50">
              {loading ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={14} />} Confirmer l'abonnement
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DashboardContent() {
  const { setHeaderExtra } = useHeader();
  const searchParams = useSearchParams();
  const tenant = searchParams.get('tenant');
  const [activeView, setActiveView] = useState<'Store' | string>('Store');
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Module[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const handleSwitch = (e: any) => e.detail && setActiveView(e.detail);
    window.addEventListener('nexus-switch-view', handleSwitch);
    return () => window.removeEventListener('nexus-switch-view', handleSwitch);
  }, []);

  const loadModules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/nexus/modules', { headers: { 'X-Tenant': tenant || 'guest' } });
      const apiModules = Array.isArray(res.data) ? res.data : res.data.modules || [];
      
      if (apiModules.length > 0) {
        setModules(apiModules);
      } else {
        // --- TES DESIGNS DE SECOURS ---
        setModules([
          {
            id: '1',
            name: 'Inventaire & Stock',
            category: 'Logistique',
            description: 'Gestion complète de vos entrepôts et mouvements de stock en temps réel.',
            price_per_month: 45000,
            color: '#6366f1',
            icon: 'Package',
            is_subscribed: true
          },
          {
            id: '2',
            name: 'Relation Client',
            category: 'CRM',
            description: 'Suivez vos prospects et gérez vos contrats clients efficacement.',
            price_per_month: 35000,
            color: '#ec4899',
            icon: 'Users',
            is_subscribed: false
          }
        ]);
      }
    } catch (e) { 
      console.error(e);
      // Optionnel: mettre les modules de secours ici aussi en cas d'erreur 500
    } finally { setLoading(false); }
  }, [tenant]);

  useEffect(() => { loadModules(); }, [loadModules]);

  const filteredModules = useMemo(() => modules.filter(m => (activeTab === 'Tous' || m.category === activeTab) && m.name.toLowerCase().includes(searchQuery.toLowerCase())), [modules, activeTab, searchQuery]);

  useEffect(() => {
    setHeaderExtra(activeView === 'Store' ? (
      <div className="flex items-center gap-4 animate-in fade-in">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
          <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-slate-100 rounded-xl py-1.5 pl-9 pr-4 text-[10px] font-bold w-48 outline-none focus:ring-2 focus:ring-indigo-500/20" />
        </div>
        <button onClick={() => setIsCartOpen(true)} className="relative bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase flex items-center gap-2">
          <ShoppingCart size={14} /> <span>Panier</span>
          {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-rose-500 text-[8px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">{cart.length}</span>}
        </button>
      </div>
    ) : (
      <button onClick={() => setActiveView('Store')} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-[9px] font-black uppercase text-slate-600">
        <LayoutGrid size={14} /> Retour au Store
      </button>
    ));
    return () => setHeaderExtra(null);
  }, [setHeaderExtra, activeView, cart.length, searchQuery]);

  const ActiveModuleComponent = MODULE_REGISTRY[activeView];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 max-w-[1700px] mx-auto">
      {toast && (
        <div className="fixed top-24 right-8 z-110 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10 border border-white/10">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <p className="text-[10px] font-black uppercase italic tracking-wider">{toast}</p>
        </div>
      )}

      {isCartOpen && <CartDrawer cart={cart} onRemove={(id: string) => setCart(cart.filter(i => i.id !== id))} onClose={() => setIsCartOpen(false)} loading={isProcessing} onCheckout={() => {}} />}

      {activeView === 'Store' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-in fade-in duration-700">
          {filteredModules.map((mod, idx) => (
            <div key={idx} className="group relative h-[240px] w-full perspective-[1500px]">
              {/* RECTO */}
              <div className="absolute inset-0 bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center shadow-sm backface-hidden group-hover:transform-[rotateY(180deg)] group-hover:opacity-0 transition-all duration-500">
                <div className="w-full flex justify-between mb-2 text-[7px] font-black text-slate-400 uppercase">
                  <span>{mod.category}</span>
                </div>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-3" style={{ backgroundColor: mod.color }}>
                  <DynamicIcon name={mod.icon} size={24} />
                </div>
                <h3 className="font-black text-[11px] text-slate-900 uppercase italic">{mod.name}</h3>
                <div className="mt-auto pt-2 w-full border-t border-slate-50 text-center font-black text-[11px]">
                  {mod.price_per_month.toLocaleString()} Ar
                </div>
              </div>
              {/* VERSO */}
              <div className="absolute inset-0 bg-slate-900 rounded-2xl p-5 flex flex-col backface-hidden transform-[rotateY(180deg)] opacity-0 group-hover:opacity-100 group-hover:transform-[rotateY(0deg)] transition-all duration-500 border border-slate-800">
                <p className="text-[9px] text-slate-300 italic flex-1">{mod.description}</p>
                <button 
                  onClick={() => mod.is_subscribed ? setActiveView(mod.name) : setCart([...cart, mod])}
                  className="w-full py-2.5 bg-white text-slate-900 rounded-xl text-[9px] font-black uppercase hover:bg-indigo-50 transition-all"
                >
                  {mod.is_subscribed ? 'Lancer' : 'Ajouter'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {ActiveModuleComponent ? <ActiveModuleComponent tenant={tenant} /> : <div className="text-center p-20 opacity-20 font-black uppercase text-xs">Module en cours de chargement...</div>}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() { 
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>}>
      <DashboardContent />
    </Suspense>
  ); 
}