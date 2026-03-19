import React from "react";
import { Users, PhoneCall, Star, Mail } from "lucide-react";

export default function CRMModule() {
  return (
    <div className="animate-in fade-in mx-auto max-w-7xl p-8 duration-500">
      <div className="mb-10 flex items-center justify-between">
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
          CRM Clients
        </h1>
        <div className="flex -space-x-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-10 w-10 rounded-full border-4 border-white bg-slate-200"
            />
          ))}
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-indigo-600 text-[10px] font-bold text-white">
            +12
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Fidélité", icon: <Star />, val: "85%" },
          { label: "Nouveaux", icon: <Users />, val: "+12" },
          { label: "Appels", icon: <PhoneCall />, val: "8" },
          { label: "Tickets", icon: <Mail />, val: "3" },
        ].map((item, i) => (
          <div
            key={i}
            className="rounded-3xl border border-slate-100 bg-white p-6 text-center"
          >
            <div className="mx-auto mb-2 h-10 w-10 text-indigo-600">
              {item.icon}
            </div>
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              {item.label}
            </p>
            <p className="text-xl font-black text-slate-900">{item.val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
