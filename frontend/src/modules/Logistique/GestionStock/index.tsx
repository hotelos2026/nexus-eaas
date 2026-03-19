import React from "react";
import { Package, ArrowDownUp, AlertCircle, BarChart3 } from "lucide-react";

export default function GestionStock() {
  const stockStats = [
    {
      label: "Articles",
      value: "2,840",
      icon: <Package />,
      color: "bg-indigo-600",
    },
    {
      label: "Mouvements",
      value: "+124",
      icon: <ArrowDownUp />,
      color: "bg-emerald-500",
    },
    {
      label: "Alertes",
      value: "5",
      icon: <AlertCircle />,
      color: "bg-rose-500",
    },
  ];

  return (
    <div className="animate-in fade-in mx-auto max-w-7xl p-8 duration-500">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-4xl leading-none font-black tracking-tighter text-slate-900 uppercase">
            Gestion Stock
          </h1>
          <p className="mt-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Entrepôt Principal • Antananarivo
          </p>
        </div>
        <button className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-3 text-[10px] font-black text-white uppercase shadow-lg shadow-indigo-200">
          <Package size={16} /> Entrée de Stock
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {stockStats.map((s, i) => (
          <div
            key={i}
            className="rounded-[2.5rem] border border-slate-100 bg-white p-8 shadow-sm"
          >
            <div
              className={`${s.color} mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-white`}
            >
              {s.icon}
            </div>
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              {s.label}
            </p>
            <p className="text-3xl font-black text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="relative mt-8 flex items-center justify-between overflow-hidden rounded-[3rem] bg-slate-900 p-8 text-white">
        <div className="z-10">
          <h3 className="mb-1 text-xl font-black uppercase">
            Analyse des flux
          </h3>
          <p className="text-xs text-slate-400">
            Visualisez la rotation de vos stocks en temps réel.
          </p>
        </div>
        <BarChart3
          size={100}
          className="absolute -right-4 -bottom-4 rotate-12 text-white/10"
        />
      </div>
    </div>
  );
}
