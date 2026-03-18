export default function GestionFlux() {
    return (
      <div className="p-10 bg-white min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">📦</div>
            <div>
              <h1 className="text-2xl font-black uppercase tracking-tighter">Gestion de Flux</h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Module Logistique Opérationnel</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 border-2 border-slate-100 rounded-2rem hover:border-orange-200 transition-colors">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Expéditions en cours</p>
              <p className="text-4xl font-black text-slate-900">124</p>
            </div>
            <div className="p-6 border-2 border-slate-100 rounded-2rem hover:border-orange-200 transition-colors">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Alertes Stock</p>
              <p className="text-4xl font-black text-red-500">12</p>
            </div>
          </div>
        </div>
      </div>
    );
  }