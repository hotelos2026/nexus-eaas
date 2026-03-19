'use client';

import { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { Loader2, CheckCircle2, ShoppingCart, X, ShieldCheck, Trash2, Info, Sparkles, Search } from 'lucide-react';
import { DynamicIcon } from '@/components/DynamicIcon';
import { useHeader } from '@/context/HeaderContext';

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

/**
 * COMPOSANT : PANIER (CART DRAWER)
 */
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
                  <p className="text-[9px] font-bold text-indigo-600">
                    {(item.promo_price_per_month || item.price_per_month).toLocaleString()} Ar
                  </p>
                </div>
                <button 
                  onClick={() => onRemove(item.id)} 
                  className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                >
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
            <button 
              onClick={onCheckout} 
              disabled={loading} 
              className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-slate-200 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : <ShieldCheck size={14} />} 
              Confirmer l'abonnement
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * COMPOSANT : CONTENU DU DASHBOARD
 */
function DashboardContent() {
  const { setHeaderExtra } = useHeader();
  const searchParams = useSearchParams();
  const tenant = searchParams.get('tenant');
  
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Module[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // CHARGEMENT DES MODULES
  const loadModules = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/nexus/modules', { headers: { 'X-Tenant': tenant || 'guest' } });
      // On s'assure d'extraire le tableau de modules de la réponse JSON
      const modulesData = res.data.modules || res.data;
      setModules(Array.isArray(modulesData) ? modulesData : []);
    } catch (e) { 
      console.error("Erreur de chargement des modules", e); 
    } finally { 
      setLoading(false); 
    }
  }, [tenant]);

  useEffect(() => { loadModules(); }, [loadModules]);
  
  const categories = useMemo(() => ['Tous', ...Array.from(new Set(modules.map(m => m.category)))], [modules]);

  // FILTRAGE (RECHERCHE + ONGLETS)
  const filteredModules = useMemo(() => {
    return modules.filter(m => {
      const matchesTab = activeTab === 'Tous' || m.category === activeTab;
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           m.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [modules, activeTab, searchQuery]);

  // FONCTION : CHECKOUT (API CALL)
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      // Appel de la nouvelle route Bulk Subscribe
      await api.post(`/nexus/modules/bulk-subscribe`, 
        { module_ids: cart.map(m => m.id) }, 
        { headers: { 'X-Tenant': tenant } }
      );

      setCart([]);
      setIsCartOpen(false);
      setToast("Abonnements activés avec succès !");
      setTimeout(() => setToast(null), 4000);
      loadModules(); // Rafraîchir l'état is_subscribed
    } catch(e) {
      alert("Erreur lors de la validation du panier. Veuillez réessayer.");
    } finally {
      setIsProcessing(false);
    }
  };

  // INJECTION DANS LE HEADER (RECHERCHE + FILTRES + PANIER)
  useEffect(() => {
    setHeaderExtra(
      <div className="flex items-center gap-4">
        {/* Barre de Recherche */}
        <div className="relative hidden md:block group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            <Search size={13} strokeWidth={3} />
          </div>
          <input 
            type="text"
            placeholder="Chercher une app..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-slate-100/80 border border-transparent focus:border-indigo-500/30 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 rounded-xl py-1.5 pl-9 pr-4 text-[10px] font-bold w-48 lg:w-64 transition-all outline-none"
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
          className="relative flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase shadow-lg hover:bg-indigo-600 transition-all active:scale-95"
        >
          <ShoppingCart size={14} /> 
          <span className="hidden sm:block">Panier</span>
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-[8px] w-4 h-4 flex items-center justify-center rounded-full border-2 border-white animate-bounce shadow-sm font-black">
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
      {/* Toast de Notification */}
      {toast && (
        <div className="fixed top-24 right-8 z-110 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10 border border-white/10">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <p className="text-[10px] font-black uppercase italic tracking-wider">{toast}</p>
        </div>
      )}
      
      {/* Drawer du Panier */}
      {isCartOpen && (
        <CartDrawer 
          cart={cart} 
          onRemove={(id: string) => setCart(cart.filter(i => i.id !== id))} 
          onClose={() => setIsCartOpen(false)} 
          loading={isProcessing} 
          onCheckout={handleCheckout} 
        />
      )}

      {loading ? (
        <div className="h-96 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
            <p className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em]">Chargement Nexus Store...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-in fade-in duration-700">
            {filteredModules.map((mod, idx) => {
              const isSubscribed = mod.is_subscribed;
              const isInCart = cart.some(item => item.id === mod.id);

              return (
                <div key={idx} className="group relative h-[240px] w-full perspective-[1500px]">
                  {/* FACE RECTO */}
                  <div className="absolute inset-0 bg-white border border-slate-100 rounded-2xl p-4 flex flex-col items-center shadow-sm backface-hidden group-hover:rotate-y-180 group-hover:opacity-0 transition-all duration-500 ease-out">
                    <div className="w-full flex justify-between items-start mb-2">
                      <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded text-[7px] font-black text-slate-400 uppercase tracking-tighter">{mod.category}</span>
                      {mod.promo_price_per_month && (
                        <span className="text-rose-500 text-[7px] font-black flex items-center gap-1 animate-pulse"><Sparkles size={8}/> PROMO</span>
                      )}
                    </div>
                    
                    <div className="relative mb-3">
                      <div className="absolute inset-0 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ backgroundColor: mod.color }} />
                      <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ backgroundColor: mod.color }}>
                        <DynamicIcon name={mod.icon} size={24} />
                      </div>
                    </div>

                    <h3 className="font-black text-[11px] text-slate-900 uppercase italic line-clamp-1">{mod.name}</h3>
                    <p className="text-[9px] text-slate-400 mt-1 line-clamp-2 leading-tight text-center px-2">{mod.description}</p>
                    
                    <div className="mt-auto pt-2 w-full flex flex-col items-center border-t border-slate-50">
                      <span className="text-[11px] font-black text-slate-900">{(mod.promo_price_per_month || mod.price_per_month).toLocaleString()} Ar</span>
                      <span className="text-[7px] font-black text-slate-300 uppercase mt-0.5 tracking-widest">Abonnement Mensuel</span>
                    </div>
                  </div>

                  {/* FACE VERSO */}
                  <div className="absolute inset-0 bg-slate-900 rounded-2xl p-5 flex flex-col backface-hidden rotate-y-180 opacity-0 group-hover:opacity-100 group-hover:rotate-y-0 transition-all duration-500 shadow-2xl border border-slate-800">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/10">
                        <Info size={12} className="text-indigo-400" />
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">Nexus Intelligence</span>
                      </div>
                      <p className="text-[9px] text-slate-300 leading-relaxed italic">
                        {mod.description || "Activez ce module pour débloquer de nouvelles fonctionnalités sur votre instance."}
                      </p>
                    </div>
                    
                    <div className="mt-2 pt-2 z-10">
                      {isSubscribed ? (
                        <div className="w-full py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl text-[9px] font-black uppercase text-center flex items-center justify-center gap-2">
                          <CheckCircle2 size={12} /> Déjà Installé
                        </div>
                      ) : (
                        <button 
                          onClick={() => { 
                            if(!isInCart) { 
                              setCart([...cart, mod]); 
                              setToast(`${mod.name} ajouté au panier`); 
                              setTimeout(() => setToast(null), 2500); 
                            } else {
                              setIsCartOpen(true);
                            }
                          }} 
                          className={`w-full py-2.5 rounded-xl text-[9px] font-black uppercase transition-all active:scale-95 shadow-lg ${
                            isInCart 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-white text-slate-900 hover:bg-indigo-50'
                          }`}
                        >
                          {isInCart ? 'Finaliser l\'achat' : 'Ajouter au Panier'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* EMPTY STATE RECHERCHE */}
          {filteredModules.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400">
              <Search size={40} className="mb-4 opacity-10" />
              <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Aucun module trouvé</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function DashboardPage() { 
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  ); 
}