import React from 'react';
import { Package, ArrowDownUp, AlertCircle, BarChart3 } from 'lucide-react';

export default function GestionStock() {
  const stockStats = [
    { label: "Articles", value: "2,840", icon: <Package />, color: "bg-indigo-600" },
    { label: "Mouvements", value: "+124", icon: <ArrowDownUp />, color: "bg-emerald-500" },
    { label: "Alertes", value: "5", icon: <AlertCircle />, color: "bg-rose-500" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Gestion Stock</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Entrepôt Principal • Antananarivo</p>
        </div>
        <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-indigo-200">
          <Package size={16} /> Entrée de Stock
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stockStats.map((s, i) => (
          <div key={i} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
            <div className={`${s.color} w-10 h-10 rounded-xl flex items-center justify-center text-white mb-4`}>{s.icon}</div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
            <p className="text-3xl font-black text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-slate-900 rounded-[3rem] p-8 text-white flex items-center justify-between overflow-hidden relative">
        <div className="z-10">
            <h3 className="text-xl font-black uppercase mb-1">Analyse des flux</h3>
            <p className="text-slate-400 text-xs">Visualisez la rotation de vos stocks en temps réel.</p>
        </div>
        <BarChart3 size={100} className="text-white/10 absolute -right-4 -bottom-4 rotate-12" />
      </div>
    </div>
  );
}