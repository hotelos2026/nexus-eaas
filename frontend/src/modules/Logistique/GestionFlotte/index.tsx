'use client';
import React from 'react';
import { Truck, MapPin, Gauge, Wrench } from 'lucide-react'; // 'Tool' remplacé par 'Wrench'

export default function GestionFlotte() {
  const stats = [
    { label: "Véhicules", val: "12", icon: <Truck size={20} />, color: "bg-amber-500" },
    { label: "En Mission", val: "8", icon: <MapPin size={20} />, color: "bg-blue-500" },
    { label: "Maintenance", val: "2", icon: <Wrench size={20} />, color: "bg-rose-500" }, // Utilisation de Wrench
    { label: "Conso Moyenne", val: "8.5L", icon: <Gauge size={20} />, color: "bg-slate-700" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">Gestion de Flotte</h1>
        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Suivi logistique et maintenance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white border border-slate-100 p-6 rounded-4xl shadow-sm transition-hover hover:shadow-md">
            <div className={`${s.color} w-10 h-10 rounded-xl flex items-center justify-center text-white mb-4`}>
              {s.icon}
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
            <p className="text-2xl font-black text-slate-900">{s.val}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-12 border-2 border-dashed border-slate-200 rounded-[3rem] text-center text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">
        Carte de suivi GPS en attente de connexion...
      </div>
    </div>
  );
}