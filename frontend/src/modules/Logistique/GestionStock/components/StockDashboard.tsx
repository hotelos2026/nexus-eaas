'use client';

import { useState, useEffect, useMemo } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import api from '@/lib/api';
import { 
  Package, AlertTriangle, RefreshCw, Plus, 
  Search, Filter, History, BarChart3, Boxes, MoreVertical
} from 'lucide-react';

// Configuration Pusher/Reverb pour le temps réel
const setupEcho = () => {
  if (typeof window === 'undefined') return null;
  return new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'nexus-key',
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || window.location.hostname,
    // CORRECTION Erreur TS 2322 : Conversion explicite en number
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
    forceTLS: false,
    enabledTransports: ['ws', 'wss'],
  });
};

export default function StockDashboard({ tenant }: { tenant: string | null }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. CHARGEMENT INITIAL DES DONNÉES
  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/logistique/stock`, { headers: { 'X-Tenant': tenant } });
      setItems(Array.isArray(res.data.items) ? res.data.items : []);
    } catch (error) {
      console.error("Erreur chargement stock, fallback démo:", error);
      setItems([
        { id: 1, name: "Laptop XPS 13", sku: "SKU-2024-001", warehouse: "Dépôt Central", qty: 45, min_stock: 10, price: "3500000" },
        { id: 2, name: "Écran 27' 4K", sku: "SKU-2024-089", warehouse: "Showroom", qty: 3, min_stock: 5, price: "1200000" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 2. ÉCOUTE TEMPS RÉEL
  useEffect(() => {
    fetchStock();

    const echo = setupEcho();
    if (echo && tenant) {
      echo.private(`inventory.${tenant}`)
        .listen('.StockUpdated', (e: any) => {
          setItems(prev => prev.map(item => 
            item.id === e.item.id ? { ...item, qty: e.item.new_qty } : item
          ));
        });
    }

    return () => echo?.disconnect();
  }, [tenant]);

  // 3. FILTRAGE DYNAMIQUE
  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [items, searchQuery]);

  // 4. CALCUL DES KPI
  const stats = useMemo(() => {
    const totalValue = items.reduce((acc, curr) => acc + (Number(curr.price) * curr.qty), 0);
    const lowStockCount = items.filter(i => i.qty <= i.min_stock).length;
    return { totalValue, lowStockCount };
  }, [items]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* HEADER ACTION BAR - Correction rounded-4xl */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-4xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100">
                <Boxes size={20} />
             </div>
             <h1 className="text-xl font-black text-slate-900 uppercase italic">
               Gestion des Stocks 
               <span className="text-[10px] not-italic bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full ml-2 border border-indigo-200">PREMIUM</span>
             </h1>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 ml-11 italic">
            Module Logistique v1.2 • <span className="text-indigo-500">{tenant || 'Master'}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={fetchStock} className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all border border-slate-100 active:scale-90">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-indigo-600 transition-all">
            <Plus size={16} /> Nouvel Arrivage
          </button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Valeur Stock" value={`${stats.totalValue.toLocaleString()} Ar`} icon={<BarChart3 size={18}/>} color="text-emerald-500" trend="+12%" />
        <StatCard title="Articles" value={items.length} icon={<Package size={18}/>} color="text-indigo-500" />
        <StatCard title="Alertes Rupture" value={stats.lowStockCount} icon={<AlertTriangle size={18}/>} color="text-rose-500" />
        <StatCard title="Mvts du jour" value="142" icon={<History size={18}/>} color="text-amber-500" trend="+5%" />
      </div>

      {/* MAIN CONTENT : TABLEAU PRO - Correction rounded-4xl */}
      <div className="bg-white rounded-4xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between gap-4">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Rechercher une référence..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              />
           </div>
           <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase text-slate-500 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors">
              <Filter size={14} /> Filtres
           </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-tighter">Article</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-tighter">Dépôt</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-tighter text-center">En Stock</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-tighter">Status</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-tighter text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.length > 0 ? filteredItems.map((item) => (
                <StockRow key={item.id} {...item} />
              )) : (
                <tr>
                  <td colSpan={5} className="p-20 text-center opacity-20 font-black uppercase text-[10px]">
                    Aucun article trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Correction rounded-3xl
function StatCard({ title, value, icon, color, trend }: any) {
  return (
    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm group hover:border-indigo-100 transition-all cursor-default">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl bg-slate-50 ${color} group-hover:scale-110 group-hover:bg-white transition-all`}>
          {icon}
        </div>
        {trend && <span className="text-[9px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg">{trend}</span>}
      </div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="text-xl font-black text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function StockRow({ name, sku, warehouse, qty, min_stock }: any) {
  const isLow = qty <= min_stock;
  return (
    <tr className="group hover:bg-slate-50/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-[11px] font-black text-slate-900 uppercase italic tracking-tight">{name}</span>
          <span className="text-[9px] font-bold text-slate-400">{sku}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-[10px] font-bold text-slate-600 uppercase tracking-tighter">{warehouse}</td>
      <td className="px-6 py-4 text-center">
        <span className={`text-xs font-black px-3 py-1 rounded-full ${isLow ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-900'}`}>
          {qty}
        </span>
      </td>
      <td className="px-6 py-4">
        {isLow ? (
          <div className="flex items-center gap-1.5 text-rose-500">
            <AlertTriangle size={12} />
            <span className="text-[8px] font-black uppercase tracking-widest">Alerte Rupture</span>
          </div>
        ) : (
          <span className="text-[8px] font-black bg-emerald-50 text-emerald-600 px-2 py-1 rounded-lg uppercase tracking-widest">Optimal</span>
        )}
      </td>
      <td className="px-6 py-4 text-right">
        <button className="p-2 hover:bg-white rounded-lg transition-all text-slate-400 hover:text-indigo-600 border border-transparent hover:border-slate-100">
          <MoreVertical size={14} />
        </button>
      </td>
    </tr>
  );
}