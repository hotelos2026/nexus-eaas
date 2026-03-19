'use client';

import { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Loader2, CheckCircle2, ShoppingCart, X, ShieldCheck, Trash2, Info, Sparkles, Search } from 'lucide-react';
import { DynamicIcon } from '@/components/DynamicIcon';
import { useHeader } from '@/context/HeaderContext';

interface Module {
  id: string; name: string; category: string; description: string;
  price_per_month: number; promo_price_per_month?: number; color: string; icon: string; is_subscribed: boolean;
}

function CartDrawer({ cart, onRemove, onClose, onCheckout, loading }: any) {
  const total = cart.reduce((acc: number, item: Module) => acc + (item.promo_price_per_month || item.price_per_month), 0);
  return (
    <div className="fixed inset-0 z-100 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative bg-white w-[350px] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div><h2 className="text-xs font-black text-slate-900 uppercase italic">Mon Panier</h2><p className="text-[9px] text-slate-400 font-bold">{cart.length} module(s)</p></div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400"><X size={18} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center"><ShoppingCart size={32} className="mb-2" /><p className="text-[9px] font-black uppercase">Vide</p></div>
          ) : (
            cart.map((item: Module) => (
              <div key={item.id} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0" style={{ backgroundColor: item.color }}><DynamicIcon name={item.icon} size={16} /></div>
                <div className="flex-1 min-w-0"><h4 className="text-[9px] font-black uppercase italic truncate">{item.name}</h4><p className="text-[9px] font-bold text-indigo-600">{(item.promo_price_per_month || item.price_per_month).toLocaleString()} Ar</p></div>
                <button onClick={() => onRemove(item.id)} className="text-slate-300 hover:text-rose-500"><Trash2 size={14} /></button>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="p-5 border-t border-slate-100 bg-slate-50/50">
            <div className="flex justify-between items-end mb-4"><span className="text-[9px] font-black text-slate-400 uppercase">Total</span><span className="text-lg font-black text-slate-900">{total.toLocaleString()} Ar</span></div>
            <button onClick={onCheckout} disabled={loading} className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-slate-200">
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
  
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState(''); // Champ de recherche
  const [cart, setCart] = useState<Module[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const loadModules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/nexus/modules', { headers: { 'X-Tenant': tenant || 'guest' } });
      setModules(Array.isArray(res.data) ? res.data : (res.data.modules || []));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [tenant]);

  useEffect(() => { loadModules(); }, [loadModules]);
  
  const categories = useMemo(() => ['Tous', ...Array.from(new Set(modules.map(m => m.category)))], [modules]);

  // Filtration combinée (Catégorie + Recherche)
  const filteredModules = useMemo(() => {
    return modules.filter(m => {
      const matchesTab = activeTab === 'Tous' || m.category === activeTab;
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            m.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [modules, activeTab, searchQuery]);

  // INJECTION DYNAMIQUE : Recherche + Filtres + Panier
  useEffect(() => {
    setHeaderExtra(
      <div className="flex items-center gap-4">
        {/* Barre de Recherche Premium */}
        <div className="relative hidden md:block group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            <Search size={13} strokeWidth={3} />
          </div>
          <input 
            type="text"
            placeholder="Rechercher un module..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-100/80 border border-transparent focus:border-indigo-500/30 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 rounded-xl py-1.5 pl-9 pr-4 text-[10px] font-bold w-48 lg:w-64 transition-all outline-none placeholder:text-slate-400 placeholder:uppercase placeholder:tracking-tighter"
          />
        </div>

        {/* Filtres Catégories */}
        <div className="hidden lg:flex gap-1 bg-slate-100/50 p-1 rounded-lg border border-slate-200/50">
          {categories.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveTab(cat)} 
              className={`px-3 py-1 rounded-md text-[8px] font-black uppercase transition-all ${activeTab === cat ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Bouton Panier */}
        <button 
          onClick={() => setIsCartOpen(true)} 
          className="relative flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase shadow-lg hover:shadow-indigo-500/20 hover:bg-indigo-600 transition-all active:scale-95"
        >
          <ShoppingCart size={14} /> <span className="hidden sm:block">Panier</span>
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-[8px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white animate-bounce shadow-sm">
              {cart.length}
            </span>
          )}
        </button>
      </div>
    );
    return () => setHeaderExtra(null);
  }, [setHeaderExtra, categories, activeTab, cart.length, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-10 max-w-[1700px] mx-auto">
      {toast && (
        <div className="fixed top-20 right-8 z-110 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-right-10 border border-white/10">
          <CheckCircle2 size={14} className="text-emerald-400" />
          <p className="text-[9px] font-black uppercase italic tracking-wider">{toast}</p>
        </div>
      )}
      
      {isCartOpen && (
        <CartDrawer 
          cart={cart} 
          onRemove={(id: string) => setCart(cart.filter(i => i.id !== id))} 
          onClose={() => setIsCartOpen(false)} 
          loading={isProcessing} 
          onCheckout={async () => { 
            setIsProcessing(true); 
            try { 
              await api.post(`/nexus/modules/bulk-subscribe`, { module_ids: cart.map(m => m.id) }, { headers: { 'X-Tenant': tenant } }); 
              setCart([]); 
              setIsCartOpen(false); 
              setToast("Abonnement activé avec succès");
              setTimeout(() => setToast(null), 3000);
              loadModules(); 
            } catch(e) { alert("Erreur lors de la confirmation"); } finally { setIsProcessing(false); } 
          }} 
        />
      )}

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
            <p className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em]">Chargement Nexus Store</p>
          </div>
        </div>
      ) : (
        <>
          {/* Grille de modules */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-in fade-in duration-700">
            {filteredModules.map((mod, idx) => {
              const isSubscribed = mod.is_subscribed === true;
              const isInCart = cart.some(item => item.id === mod.id);
              return (
                <div key={idx} className="group relative h-[230px] w-full perspective-[1500px]">
                  {/* Recto (Détails de base) */}
                  <div className="absolute inset-0 bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center shadow-sm backface-hidden group-hover:rotate-y-180 group-hover:opacity-0 transition-all duration-500 ease-out">
                    <div className="w-full flex justify-between items-start mb-2">
                      <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[7px] font-black text-slate-400 uppercase tracking-tighter">{mod.category}</span>
                      {mod.promo_price_per_month && <span className="text-rose-500 text-[7px] font-black flex items-center gap-1 animate-pulse"><Sparkles size={8}/> PROMO</span>}
                    </div>
                    
                    <div className="relative mb-2">
                      <div className="absolute inset-0 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: mod.color }}></div>
                      <div className="relative w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: mod.color }}>
                        <DynamicIcon name={mod.icon} size={20} />
                      </div>
                    </div>

                    <h3 className="font-black text-[10px] text-slate-900 uppercase italic line-clamp-1">{mod.name}</h3>
                    <p className="text-[8px] text-slate-400 mt-1 line-clamp-2 leading-tight text-center px-2">{mod.description || "Module professionnel Nexus OS"}</p>
                    
                    <div className="mt-auto pt-2 w-full flex flex-col items-center border-t border-slate-50">
                      <span className="text-[11px] font-black text-slate-900">{(mod.promo_price_per_month || mod.price_per_month).toLocaleString()} Ar</span>
                      <span className="text-[7px] font-black text-slate-300 uppercase mt-0.5 tracking-widest">/ Mois</span>
                    </div>
                  </div>

                  {/* Verso (Action / Détails techniques) */}
                  <div className="absolute inset-0 bg-slate-900 rounded-2xl p-4 flex flex-col backface-hidden rotate-y-180 opacity-0 group-hover:opacity-100 group-hover:rotate-y-0 transition-all duration-500 shadow-2xl overflow-hidden border border-slate-800">
                    <div className="flex-1 overflow-hidden z-10">
                      <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/10">
                        <Info size={10} className="text-indigo-400" />
                        <span className="text-[8px] font-black text-white uppercase tracking-widest">Fonctionnalités</span>
                      </div>
                      <p className="text-[8px] text-slate-300 leading-snug italic">
                        {mod.description || "Optimisez vos flux avec cette solution intégrée nativement à votre instance Nexus."}
                      </p>
                    </div>
                    
                    <div className="mt-2 pt-2 border-t border-white/10 z-10">
                      {isSubscribed ? (
                        <div className="w-full py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-[8px] font-black uppercase text-center flex items-center justify-center gap-2">
                          <CheckCircle2 size={10} /> Actif
                        </div>
                      ) : (
                        <button 
                          onClick={() => { 
                            if(!isInCart) { 
                              setCart([...cart, mod]); 
                              setToast(`${mod.name} ajouté`); 
                              setTimeout(() => setToast(null), 2000); 
                            } 
                            setIsCartOpen(true); 
                          }} 
                          className={`w-full py-2 ${isInCart ? 'bg-indigo-600 text-white shadow-indigo-500/40' : 'bg-white text-slate-900 hover:bg-indigo-50'} rounded-lg text-[8px] font-black uppercase transition-all active:scale-95 shadow-lg`}
                        >
                          {isInCart ? 'Voir le Panier' : 'Commander'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* État vide si aucune recherche ne correspond */}
          {filteredModules.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 animate-in fade-in zoom-in-95">
              <Search size={32} className="mb-3 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest">Aucun module ne correspond à "{searchQuery}"</p>
            </div>
          )}
        </>
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