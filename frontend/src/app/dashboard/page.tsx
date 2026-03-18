'use client';

import { useState, Suspense } from 'react';
import { 
  BookOpen, Bus, Coffee, GraduationCap, Calculator, 
  ShieldCheck, CheckCircle2, Star, X, Smartphone,
  Zap, Bell, Globe, LayoutGrid 
} from 'lucide-react';

const modulesData = [
  { id: 1, name: "Gestion Scolaire", cat: "ACADÉMIQUE", price: 0, isPro: false, installed: true, icon: <GraduationCap size={20}/>, color: "indigo" },
  { id: 2, name: "Cantine Pro", cat: "LOGISTIQUE", price: 250000, isPro: true, installed: false, icon: <Coffee size={20}/>, color: "orange" },
  { id: 3, name: "Finance & Frais", cat: "FINANCE", price: 600000, promo: 550000, isPro: true, installed: true, icon: <Calculator size={20}/>, color: "purple" },
  { id: 4, name: "Transport GPS", cat: "LOGISTIQUE", price: 450000, isPro: false, installed: false, icon: <Bus size={20}/>, color: "emerald" },
  { id: 5, name: "Bibliothèque", cat: "ACADÉMIQUE", price: 75000, promo: 0, isPro: false, installed: false, icon: <BookOpen size={20}/>, color: "amber" },
  { id: 6, name: "Espace Parents", cat: "SÉCURITÉ", price: 150000, promo: 120000, isPro: true, installed: false, icon: <ShieldCheck size={20}/>, color: "sky" },
  { id: 7, name: "Examens Online", cat: "ACADÉMIQUE", price: 300000, promo: 210000, isPro: true, installed: false, icon: <Zap size={20}/>, color: "rose" },
  { id: 8, name: "Notifications SMS", cat: "COMM", price: 100000, isPro: false, installed: false, icon: <Bell size={20}/>, color: "blue" },
  { id: 9, name: "Emploi du Temps", cat: "ACADÉMIQUE", price: 0, isPro: false, installed: false, icon: <Globe size={20}/>, color: "cyan" },
  { id: 10, name: "Pointage Facial", cat: "SÉCURITÉ", price: 850000, isPro: true, installed: false, icon: <ShieldCheck size={20}/>, color: "slate" },
  { id: 11, name: "Carnet de Liaison", cat: "ACADÉMIQUE", price: 50000, isPro: false, installed: false, icon: <BookOpen size={20}/>, color: "indigo" },
  { id: 12, name: "Stock & Inventaire", cat: "LOGISTIQUE", price: 180000, isPro: false, installed: false, icon: <LayoutGrid size={20}/>, color: "orange" },
];

function DashboardContent() {
  const [modules, setModules] = useState(modulesData);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('Tous');
  const [paymentStep, setPaymentStep] = useState(1);
  const [selectedOperator, setSelectedOperator] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const formatAr = (val: number) => new Intl.NumberFormat('fr-MG').format(val) + " Ar";

  const handleAction = (mod: any) => {
    if (mod.installed) {
      setModules(modules.map(m => m.id === mod.id ? { ...m, installed: false } : m));
    } else {
      setSelectedModule(mod);
      setPaymentStep(1);
    }
  };

  const confirmActivation = () => {
    setModules(modules.map(m => m.id === selectedModule.id ? { ...m, installed: true } : m));
    setSelectedModule(null);
    setPhoneNumber('');
    setSelectedOperator('');
  };

  return (
    <>
      <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center justify-between sticky top-0 z-30">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto scrollbar-hide">
          {['Tous', 'ACADÉMIQUE', 'LOGISTIQUE', 'FINANCE', 'SÉCURITÉ'].map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveTab(cat)} 
              className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase whitespace-nowrap transition-all ${activeTab === cat ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase italic">
           App Store Madagascar (MGA)
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-5">
          {modules.filter(m => activeTab === 'Tous' || m.cat === activeTab).map((mod) => (
            <div key={mod.id} className="group relative bg-white border border-slate-200 rounded-4xl p-5 transition-all duration-300 hover:border-indigo-400 hover:shadow-2xl flex flex-col items-center">
              {mod.isPro && (
                <div className="absolute top-3 left-3 flex items-center gap-1 bg-linear-to-tr from-amber-500 to-yellow-400 text-white text-[7px] font-black px-2 py-0.5 rounded-lg shadow-md z-10 uppercase animate-pulse">
                  <Star size={7} fill="currentColor" /> Pro
                </div>
              )}

              <div className="absolute top-3 right-3 z-10">
                {mod.installed ? (
                  <div className="bg-emerald-100 text-emerald-600 p-1 rounded-full border border-emerald-200">
                     <CheckCircle2 size={12} strokeWidth={3}/>
                  </div>
                ) : (
                  <div className="text-right scale-90 origin-right">
                    <p className="text-[10px] font-black text-slate-900 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 italic">
                      {mod.price === 0 ? "GRATUIT" : formatAr(mod.promo ?? mod.price)}
                    </p>
                  </div>
                )}
              </div>

              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-500 group-hover:rotate-12 shadow-inner
                  ${mod.color === 'indigo' ? 'bg-indigo-50 text-indigo-600 shadow-indigo-100' : ''}
                  ${mod.color === 'orange' ? 'bg-orange-50 text-orange-600 shadow-orange-100' : ''}
                  ${mod.color === 'emerald' ? 'bg-emerald-50 text-emerald-600 shadow-emerald-100' : ''}
                  ${mod.color === 'purple' ? 'bg-purple-50 text-purple-600 shadow-purple-100' : ''}
                  ${mod.color === 'amber' ? 'bg-amber-50 text-amber-600 shadow-amber-100' : ''}
                  ${mod.color === 'sky' ? 'bg-sky-50 text-sky-600 shadow-sky-100' : ''}
                  ${mod.color === 'rose' ? 'bg-rose-50 text-rose-600 shadow-rose-100' : ''}
                  ${mod.color === 'slate' ? 'bg-slate-50 text-slate-600 shadow-slate-100' : ''}
              `}>
                {mod.icon}
              </div>

              <div className="text-center w-full min-w-0">
                <h3 className="font-black text-[11px] text-slate-800 truncate px-1 uppercase">{mod.name}</h3>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 opacity-60">{mod.cat}</p>
              </div>
              
              <div className="w-full mt-4">
                  <button 
                      onClick={() => handleAction(mod)}
                      className={`w-full py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all
                      ${mod.installed 
                          ? 'bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 border border-transparent hover:border-red-100' 
                          : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:shadow-indigo-300'
                      }`}
                  >
                      {mod.installed ? "Désactiver" : "Activer"}
                  </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedModule && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setSelectedModule(null)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                 <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center italic font-black">Ar</div>
                 <button onClick={() => setSelectedModule(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
              </div>

              <h2 className="text-xl font-black text-slate-900 leading-tight">Activer {selectedModule.name}</h2>
              <p className="text-slate-400 text-xs mt-1 font-bold uppercase tracking-widest">{selectedModule.cat}</p>

              {paymentStep === 1 ? (
                <div className="mt-8 space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Choisir un opérateur</p>
                  <PaymentOption active={selectedOperator === 'MVola'} onClick={() => {setSelectedOperator('MVola'); setPaymentStep(2)}} color="border-yellow-400 text-yellow-600 bg-yellow-50/30" label="MVola" />
                  <PaymentOption active={selectedOperator === 'Airtel'} onClick={() => {setSelectedOperator('Airtel'); setPaymentStep(2)}} color="border-red-500 text-red-600 bg-red-50/30" label="Airtel Money" />
                  <PaymentOption active={selectedOperator === 'Orange'} onClick={() => {setSelectedOperator('Orange'); setPaymentStep(2)}} color="border-orange-500 text-orange-600 bg-orange-50/30" label="Orange Money" />
                </div>
              ) : (
                <div className="mt-8 animate-in slide-in-from-right duration-300">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-4">Numéro {selectedOperator}</p>
                  <div className="relative">
                    <input 
                      type="text" 
                      placeholder="034 XX XXX XX" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-slate-100 border-2 border-transparent focus:border-indigo-600 rounded-2xl py-4 px-6 text-lg font-black outline-none transition-all"
                    />
                    <Smartphone className="absolute right-4 top-4 text-slate-300" size={20}/>
                  </div>
                  
                  <div className="mt-6 p-4 bg-indigo-600 rounded-2xl text-white shadow-xl">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Net à payer</span>
                       <span className="text-lg font-black">{formatAr(selectedModule.promo ?? selectedModule.price)}</span>
                    </div>
                  </div>

                  <button 
                    onClick={confirmActivation}
                    disabled={phoneNumber.length < 10}
                    className="w-full mt-4 bg-slate-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-black transition-all disabled:opacity-30 flex items-center justify-center gap-3"
                  >
                    Confirmer & Activer
                  </button>
                  <button onClick={() => setPaymentStep(1)} className="w-full mt-2 text-slate-400 text-[10px] font-bold uppercase py-2 hover:text-slate-600 transition-colors">Retour</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PaymentOption({ color, label, onClick, active }: any) {
  return (
    <div onClick={onClick} className={`flex items-center justify-between p-4 border-2 rounded-2xl cursor-pointer transition-all ${color} ${active ? 'scale-[1.02] shadow-md ring-2 ring-current ring-offset-2' : 'opacity-70 hover:opacity-100'}`}>
       <span className="font-black text-sm">{label}</span>
       <div className={`w-5 h-5 rounded-full border-2 border-current flex items-center justify-center`}>
          {active && <div className="w-2 h-2 bg-current rounded-full"></div>}
       </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <Suspense fallback={<div className="h-full flex items-center justify-center text-slate-400 text-[10px] uppercase font-black tracking-widest">Chargement de l'App Store...</div>}>
      <DashboardContent />
    </Suspense>
  );
}