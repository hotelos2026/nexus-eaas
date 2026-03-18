import React from 'react';
import { ShoppingCart, CreditCard, Users, History } from 'lucide-react';

export default function POSModule() {
  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Header du Module */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Point de Vente</h1>
          <p className="text-indigo-500 font-bold text-xs uppercase tracking-[0.3em]">Session Active: Caisse #01</p>
        </div>
        <div className="flex gap-3">
           <button className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 hover:bg-indigo-600 transition-all">
             <ShoppingCart size={16} /> Nouvelle Vente
           </button>
        </div>
      </div>

      {/* Grille de raccourcis */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Paiements", icon: <CreditCard />, color: "bg-emerald-500" },
          { label: "Clients", icon: <Users />, color: "bg-blue-500" },
          { label: "Historique", icon: <History />, color: "bg-amber-500" },
          { label: "Inventaire", icon: <ShoppingCart />, color: "bg-indigo-500" },
        ].map((item, i) => (
          <div key={i} className="group cursor-pointer bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`${item.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
              {item.icon}
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
            <p className="text-slate-900 font-bold mt-1">Gérer les {item.label.toLowerCase()}</p>
          </div>
        ))}
      </div>

      {/* Zone de notification / État */}
      <div className="mt-10 p-6 bg-slate-50 border border-dashed border-slate-200 rounded-4xl flex items-center justify-center">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">En attente d'opérations sur la caisse...</p>
      </div>
    </div>
  );
}