"use client";
import React from "react";
import { Truck, MapPin, Gauge, Wrench } from "lucide-react"; // 'Tool' remplacé par 'Wrench'

export default function GestionFlotte() {
  const stats = [
    {
      label: "Véhicules",
      val: "12",
      icon: <Truck size={20} />,
      color: "bg-amber-500",
    },
    {
      label: "En Mission",
      val: "8",
      icon: <MapPin size={20} />,
      color: "bg-blue-500",
    },
    {
      label: "Maintenance",
      val: "2",
      icon: <Wrench size={20} />,
      color: "bg-rose-500",
    }, // Utilisation de Wrench
    {
      label: "Conso Moyenne",
      val: "8.5L",
      icon: <Gauge size={20} />,
      color: "bg-slate-700",
    },
  ];

  return (
    <div className="animate-in fade-in mx-auto max-w-7xl p-8 duration-500">
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
          Gestion de Flotte
        </h1>
        <p className="mt-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          Suivi logistique et maintenance
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {stats.map((s, i) => (
          <div
            key={i}
            className="transition-hover rounded-4xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md"
          >
            <div
              className={`${s.color} mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-white`}
            >
              {s.icon}
            </div>
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              {s.label}
            </p>
            <p className="text-2xl font-black text-slate-900">{s.val}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-[3rem] border-2 border-dashed border-slate-200 p-12 text-center text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
        Carte de suivi GPS en attente de connexion...
      </div>
    </div>
  );
}
