import React from "react";
import { ShoppingCart, CreditCard, Users, History } from "lucide-react";

export default function POSModule() {
  return (
    <div className="animate-in fade-in mx-auto max-w-7xl p-8 duration-500">
      {/* Header du Module */}
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
            Point de Vente
          </h1>
          <p className="text-xs font-bold tracking-[0.3em] text-indigo-500 uppercase">
            Session Active: Caisse #01
          </p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-[10px] font-black text-white uppercase transition-all hover:bg-indigo-600">
            <ShoppingCart size={16} /> Nouvelle Vente
          </button>
        </div>
      </div>

      {/* Grille de raccourcis */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {[
          { label: "Paiements", icon: <CreditCard />, color: "bg-emerald-500" },
          { label: "Clients", icon: <Users />, color: "bg-blue-500" },
          { label: "Historique", icon: <History />, color: "bg-amber-500" },
          {
            label: "Inventaire",
            icon: <ShoppingCart />,
            color: "bg-indigo-500",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="group cursor-pointer rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div
              className={`${item.color} mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg transition-transform group-hover:scale-110`}
            >
              {item.icon}
            </div>
            <p className="text-[11px] font-black tracking-widest text-slate-400 uppercase">
              {item.label}
            </p>
            <p className="mt-1 font-bold text-slate-900">
              Gérer les {item.label.toLowerCase()}
            </p>
          </div>
        ))}
      </div>

      {/* Zone de notification / État */}
      <div className="mt-10 flex items-center justify-center rounded-4xl border border-dashed border-slate-200 bg-slate-50 p-6">
        <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          En attente d'opérations sur la caisse...
        </p>
      </div>
    </div>
  );
}
