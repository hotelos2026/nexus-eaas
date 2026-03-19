'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
  Package, PlusCircle, MinusCircle, AlertTriangle, 
  Loader2, Search, ArrowRightLeft, RefreshCw 
} from 'lucide-react';

export default function StockDashboard({ tenant }: { tenant: string | null }) {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    if (!tenant) return;
    try {
      setLoading(true);
      const res = await api.get('/nexus/inventory/stocks', { headers: { 'X-Tenant': tenant } });
      setStocks(res.data);
    } catch (err) {
      console.error("Erreur de chargement", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [tenant]);

  return (
    <div className="space-y-6">
      {/* Barre d'actions spécifique au module */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic uppercase tracking-tighter flex items-center gap-3">
            <Package className="text-[#4f46e5]" size={28} />
            Gestion des Stocks
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Module Logistique v1.0</p>
        </div>
        
        <div className="flex gap-2">
           <button onClick={loadData} className="p-2.5 text-slate-400 hover:text-[#4f46e5] bg-slate-50 rounded-xl transition-all">
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button className="bg-[#4f46e5] text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 hover:shadow-lg hover:shadow-[#4f46e5]/20 transition-all active:scale-95">
            <PlusCircle size={16} /> Nouvel Arrivage
          </button>
        </div>
      </div>

      {/* Table de données style Nexus */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-50 bg-slate-50/30">
            <div className="relative max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                    type="text" 
                    placeholder="Filtrer l'inventaire..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold outline-none focus:border-[#4f46e5] transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-[11px] font-bold">
            <thead className="bg-slate-50/50 text-slate-400 uppercase text-[9px] font-black tracking-widest">
              <tr>
                <th className="px-6 py-4 text-left">Article</th>
                <th className="px-6 py-4 text-left">Dépôt</th>
                <th className="px-6 py-4 text-center">En Stock</th>
                <th className="px-6 py-4 text-left">Alerte</th>
                <th className="px-6 py-4 text-right">Mouvements</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center text-slate-400"><Loader2 className="animate-spin mx-auto" /></td></tr>
              ) : stocks.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-slate-400 italic font-medium uppercase text-[10px]">Aucune donnée disponible</td></tr>
              ) : (
                stocks.map((s: any) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4 font-black text-slate-900 uppercase tracking-tighter italic">ID #{s.product_id}</td>
                    <td className="px-6 py-4 text-slate-500">{s.warehouse_name}</td>
                    <td className={`px-6 py-4 text-center text-base font-black ${s.quantity <= s.alert_level ? 'text-rose-500' : 'text-slate-900'}`}>{s.quantity}</td>
                    <td className="px-6 py-4">
                        {s.quantity <= s.alert_level ? (
                            <div className="flex items-center gap-1.5 text-rose-500 bg-rose-50 px-2 py-1 rounded-lg w-fit">
                                <AlertTriangle size={12} /> <span className="text-[8px] font-black uppercase">Réappro !</span>
                            </div>
                        ) : <span className="text-emerald-500 uppercase text-[8px] font-black">Stock OK</span>}
                    </td>
                    <td className="px-6 py-4 text-right space-x-1">
                        <button className="p-2 bg-slate-100 rounded-lg text-slate-400 hover:text-[#4f46e5] transition-all"><ArrowRightLeft size={14} /></button>
                        <button className="p-2 bg-slate-100 rounded-lg text-slate-400 hover:text-emerald-500 transition-all"><PlusCircle size={14} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}