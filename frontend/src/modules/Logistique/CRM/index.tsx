import React from 'react';
import { Users, PhoneCall, Star, Mail } from 'lucide-react';

export default function CRMModule() {
  return (
    <div className="p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase">CRM Clients</h1>
        <div className="flex -space-x-3">
          {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200" />)}
          <div className="w-10 h-10 rounded-full border-4 border-white bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">+12</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Fidélité", icon: <Star />, val: "85%" },
          { label: "Nouveaux", icon: <Users />, val: "+12" },
          { label: "Appels", icon: <PhoneCall />, val: "8" },
          { label: "Tickets", icon: <Mail />, val: "3" },
        ].map((item, i) => (
          <div key={i} className="p-6 bg-white border border-slate-100 rounded-3xl text-center">
            <div className="mx-auto w-10 h-10 text-indigo-600 mb-2">{item.icon}</div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
            <p className="text-xl font-black text-slate-900">{item.val}</p>
          </div>
        ))}
      </div>
    </div>
  );
}