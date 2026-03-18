'use client';

import { Menu, Search, PanelLeftClose, PanelLeft, Bell } from 'lucide-react';

export default function Header({ 
  setMobileSidebarOpen, 
  isSidebarCollapsed, 
  setSidebarCollapsed 
}: any) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 transition-all shrink-0 z-40">
      
      {/* SECTION GAUCHE : NAVIGATION & RECHERCHE */}
      <div className="flex items-center gap-4 w-full">
        
        {/* Toggle Mobile : Visible uniquement sur mobile pour ouvrir la sidebar */}
        <button 
          onClick={() => setMobileSidebarOpen(true)} 
          className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          title="Ouvrir le menu"
        >
          <Menu size={20} />
        </button>

        {/* Toggle Desktop : Pour réduire/agrandir la sidebar (Collapse) */}
        <button 
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)} 
          className="hidden lg:block p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-md transition-all active:scale-90"
          title={isSidebarCollapsed ? "Agrandir" : "Réduire"}
        >
          {isSidebarCollapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
        </button>
        
        {/* Barre de recherche intelligente */}
        <div className="hidden md:block relative max-w-md w-full ml-2 group">
           <input 
             type="text" 
             placeholder="Rechercher un module (ex: Cantine, Notes)..." 
             className="w-full bg-slate-100 border-2 border-transparent rounded-full py-2 px-10 text-sm focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all outline-none text-slate-700" 
           />
           <div className="absolute left-3.5 top-2.5 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
             <Search size={16}/>
           </div>
        </div>
      </div>

      {/* SECTION DROITE : NOTIFICATIONS & PROFIL */}
      <div className="flex items-center gap-3 lg:gap-5 shrink-0">
        
        {/* Notifications */}
        <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl relative transition-all group">
            <Bell size={20} className="group-hover:rotate-12 transition-transform" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        </button>

        {/* Séparateur visuel discret */}
        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        {/* Profil Utilisateur (Avatar) */}
        <div className="flex items-center gap-3 pl-1">
          <div className="hidden lg:flex flex-col items-end">
            <span className="text-[11px] font-black text-slate-900 leading-none uppercase tracking-tighter">Administrateur</span>
            <span className="text-[9px] font-bold text-emerald-500 leading-none mt-1 uppercase tracking-widest">Online</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-600 to-indigo-700 border border-indigo-700 flex items-center justify-center text-xs font-black text-white shadow-lg shadow-indigo-100 cursor-pointer hover:scale-105 active:scale-95 transition-all">
            AD
          </div>
        </div>

      </div>
    </header>
  );
}