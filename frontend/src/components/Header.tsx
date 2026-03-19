'use client';

import { usePathname } from "next/navigation";
import { Menu, PanelLeftClose, PanelLeft, Bell, LayoutGrid, ShoppingCart } from "lucide-react";

export default function Header({ setMobileSidebarOpen, isSidebarCollapsed, setSidebarCollapsed, extraContent }: any) {
  const pathname = usePathname();
  const isAppStore = pathname?.includes("/dashboard");

  const getPageTitle = () => {
    if (isAppStore) return "App Store";
    if (pathname?.includes("/scolarite")) return "Scolarité";
    return "Nexus OS";
  };

  return (
    <header className="z-40 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button onClick={() => setMobileSidebarOpen(true)} className="rounded-xl p-2 text-slate-600 lg:hidden"><Menu size={18} /></button>
        <button onClick={() => setSidebarCollapsed(!isSidebarCollapsed)} className="hidden p-2 text-slate-400 hover:text-indigo-600 lg:flex">
          {isSidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>
        <div className="mx-1 hidden h-5 w-px bg-slate-100 lg:block"></div>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white shadow-md"><LayoutGrid size={14} /></div>
          <div className="flex flex-col">
            <h1 className="text-[10px] leading-none font-black tracking-tighter text-slate-900 uppercase italic">{getPageTitle()}</h1>
            <p className="text-[6px] font-bold tracking-widest text-slate-400 uppercase">Management System</p>
          </div>
        </div>
        {isAppStore && (
          <div className="ml-2 flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
            <div className="h-5 w-px bg-slate-100 mx-1" />
            {extraContent ? extraContent : (
              <button className="flex items-center gap-2 bg-slate-100 text-slate-400 px-3 py-1.5 rounded-lg border border-slate-200 opacity-50 cursor-not-allowed">
                <ShoppingCart size={14} /> <span className="text-[9px] font-black uppercase hidden sm:block">Panier</span>
              </button>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-slate-400 hover:text-indigo-600">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full border border-white bg-rose-500"></span>
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-[9px] font-black text-slate-600">AD</div>
      </div>
    </header>
  );
}