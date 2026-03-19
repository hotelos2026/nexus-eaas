'use client';

import { useState, useEffect, useMemo } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import api from '@/lib/api';
import { 
  Package, AlertTriangle, RefreshCw, Plus, 
  Search, Filter, History, BarChart3, Boxes, MoreVertical, X, Loader2
} from 'lucide-react';

// --- CONFIGURATION ECHO ---
const setupEcho = () => {
  if (typeof window === 'undefined') return null;
  (window as any).Pusher = Pusher;
  return new Echo({
    broadcaster: 'reverb',
    key: process.env.NEXT_PUBLIC_REVERB_APP_KEY || 'nexus-key',
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || window.location.hostname,
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 8080,
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT) || 443,
    forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === 'https',
    enabledTransports: ['ws', 'wss'],
  });
};

// --- COMPOSANT MODAL ---
function AddStockModal({ isOpen, onClose, tenant, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', sku: '', qty: 0, warehouse_id: 1 });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/logistique/stock/add', formData, { headers: { 'X-Tenant': tenant } });
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erreur ajout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-sm font-black uppercase italic text-slate-900">Nouvel Arrivage</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl text-slate-400"><X size={18}/></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Article</label>
            <input required className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20" 
              onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">SKU</label>
              <input required className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-xs font-bold" 
                onChange={e => setFormData({...formData, sku: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Quantité</label>
              <input type="number" required className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-xs font-bold" 
                onChange={e => setFormData({...formData, qty: parseInt(e.target.value)})} />
            </div>
          </div>
          <button disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl flex justify-center items-center gap-2">
            {loading ? <Loader2 className="animate-spin" size={16}/> : 'Valider le mouvement'}
          </button>
        </form>
      </div>
    </div>
  );
}

// --- MAIN DASHBOARD ---
export default function StockDashboard({ tenant }: { tenant: string | null }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchStock = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/logistique/stock`, { headers: { 'X-Tenant': tenant } });
      setItems(Array.isArray(res.data.items) ? res.data.items : []);
    } catch (error) {
      console.error("Fallback démo...");
      setItems([
        { id: 1, name: "Laptop XPS 13", sku: "SKU-2024-001", warehouse: "Dépôt Central", qty: 45, min_stock: 10, price: 3500000 },
        { id: 2, name: "Écran 27' 4K", sku: "SKU-2024-089", warehouse: "Showroom", qty: 3, min_stock: 5, price: 1200000 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
    const echo = setupEcho();
    if (echo && tenant) {
      echo.channel(`inventory.${tenant}`) // On utilise channel public pour simplifier le test
        .listen('.StockUpdated', (e: any) => {
          setItems(prev => prev.map(item => 
            item.sku === e.item.sku ? { ...item, qty: item.qty + e.item.new_qty } : item
          ));
        });
    }
    return () => echo?.disconnect();
  }, [tenant]);

  const filteredItems = useMemo(() => items.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) || i.sku.toLowerCase().includes(searchQuery.toLowerCase())
  ), [items, searchQuery]);

  const stats = useMemo(() => ({
    totalValue: items.reduce((acc, curr) => acc + (Number(curr.price) * curr.qty), 0),
    lowStockCount: items.filter(i => i.qty <= i.min_stock).length
  }), [items]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <AddStockModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} tenant={tenant} onSuccess={fetchStock} />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-100"><Boxes size={20} /></div>
             <h1 className="text-xl font-black text-slate-900 uppercase italic">Gestion des Stocks</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchStock} className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-all border border-slate-100">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase shadow-lg hover:bg-indigo-600 transition-all">
            <Plus size={16} /> Nouvel Arrivage
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Valeur Stock" value={`${stats.totalValue.toLocaleString()} Ar`} icon={<BarChart3 size={18}/>} color="text-emerald-500" trend="+12%" />
        <StatCard title="Articles" value={items.length} icon={<Package size={18}/>} color="text-indigo-500" />
        <StatCard title="Alertes Rupture" value={stats.lowStockCount} icon={<AlertTriangle size={18}/>} color="text-rose-500" />
        <StatCard title="Mvts du jour" value="142" icon={<History size={18}/>} color="text-amber-500" trend="+5%" />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between gap-4">
           <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Rechercher..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all" />
           </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase">Article</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase text-center">En Stock</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase">Status</th>
                <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map((item) => <StockRow key={item.id} {...item} />)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color, trend }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group hover:border-indigo-200 transition-all">
      <div className={`p-3 w-fit rounded-2xl bg-slate-50 ${color} mb-4`}>{icon}</div>
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
      <p className="text-xl font-black text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function StockRow({ name, sku, qty, min_stock }: any) {
  const isLow = qty <= min_stock;
  return (
    <tr className="group hover:bg-slate-50/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex flex-col"><span className="text-[11px] font-black text-slate-900 uppercase italic">{name}</span><span className="text-[9px] font-bold text-slate-400">{sku}</span></div>
      </td>
      <td className="px-6 py-4 text-center">
        <span className={`text-xs font-black px-3 py-1 rounded-full ${isLow ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-900'}`}>{qty}</span>
      </td>
      <td className="px-6 py-4">
        {isLow ? <span className="text-[8px] font-black text-rose-500 uppercase">Alerte Rupture</span> : <span className="text-[8px] font-black text-emerald-600 uppercase">Optimal</span>}
      </td>
      <td className="px-6 py-4 text-right"><button className="text-slate-300 hover:text-indigo-600"><MoreVertical size={14}/></button></td>
    </tr>
  );
}