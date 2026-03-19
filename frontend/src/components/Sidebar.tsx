'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import {
  Users,
  Settings,
  LogOut,
  Rocket,
  Store,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { DynamicIcon } from "@/components/DynamicIcon";

interface SubscribedModule {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_subscribed: boolean;
}

export default function Sidebar({ isMobileOpen, isCollapsed }: any) {
  const searchParams = useSearchParams();
  const tenant = searchParams.get('tenant');
  
  const [subscribedModules, setSubscribedModules] = useState<SubscribedModule[]>([]);
  const [loading, setLoading] = useState(true);
  
  // État local pour savoir quel bouton est visuellement "actif"
  const [currentActive, setCurrentActive] = useState<string>('Store');
  const lastFetchTime = useRef(0);

  /**
   * ACTION : CHANGER DE VUE
   * Au lieu de changer d'URL, on envoie un événement au Dashboard
   */
  const switchView = (viewName: string) => {
    setCurrentActive(viewName);
    window.dispatchEvent(new CustomEvent('nexus-switch-view', { detail: viewName }));
    
    // Si on est sur mobile, on pourrait ajouter une logique pour fermer la sidebar ici
  };

  const fetchSubscribedModules = useCallback(async (showLoader = true) => {
    if (!tenant) return;
    const now = Date.now();
    if (now - lastFetchTime.current < 1000) return;
    lastFetchTime.current = now;

    try {
      if (showLoader) setLoading(true);
      const res = await api.get('/nexus/modules', { headers: { 'X-Tenant': tenant } });
      const allModules = res.data.modules || res.data;
      if (Array.isArray(allModules)) {
        setSubscribedModules(allModules.filter((m: any) => m.is_subscribed));
      }
    } catch (e) {
      console.error("Erreur sidebar modules:", e);
    } finally {
      setLoading(false);
    }
  }, [tenant]);

  useEffect(() => {
    fetchSubscribedModules();
    const handleModulePurchased = () => fetchSubscribedModules(false);
    window.addEventListener('nexus-module-purchased', handleModulePurchased);
    return () => window.removeEventListener('nexus-module-purchased', handleModulePurchased);
  }, [fetchSubscribedModules]);

  const handleLogout = async () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = tenant ? `/login?tenant=${tenant}` : "/login";
  };

  return (
    <aside className={`fixed inset-y-0 left-0 z-50 transform border-r border-slate-200 bg-white transition-all duration-300 ease-in-out lg:static ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}>
      <div className="flex h-full flex-col overflow-hidden">
        
        {/* LOGO */}
        <div className={`flex items-center p-6 mb-2 ${isCollapsed ? "justify-center" : "justify-between"}`}>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-100">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-black tracking-tighter text-slate-900 uppercase leading-none">
                  NEXUS <span className="text-indigo-600">OS</span>
                </span>
                <span className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Management Hub</span>
              </div>
            )}
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="scrollbar-hide flex-1 space-y-1 overflow-y-auto px-4">
          <div className="mb-6">
              <p className={`text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] mb-3 px-2 ${isCollapsed ? "text-center" : ""}`}>Platform</p>
              <NavItem
                icon={<Store size={18} />}
                label="App Store"
                active={currentActive === 'Store'}
                isCollapsed={isCollapsed}
                onClick={() => switchView('Store')}
              />
              <NavItem icon={<Users size={18} />} label="Équipe" isCollapsed={isCollapsed} onClick={() => {}} />
          </div>

          <div className="pt-4">
            <div className="flex items-center justify-between mb-3 px-2">
                <p className={`text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] ${isCollapsed ? "mx-auto" : ""}`}>Applications</p>
                {!isCollapsed && subscribedModules.length > 0 && (
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-50 text-[8px] font-bold text-indigo-600 animate-in zoom-in">
                        {subscribedModules.length}
                    </span>
                )}
            </div>
            
            <div className="space-y-1">
                {loading && subscribedModules.length === 0 ? (
                  <div className="flex justify-center py-6 opacity-20"><Loader2 size={20} className="animate-spin text-slate-900" /></div>
                ) : subscribedModules.length > 0 ? (
                  subscribedModules.map((mod) => (
                    <NavItem
                        key={mod.id}
                        icon={<DynamicIcon name={mod.icon} size={18} />}
                        label={mod.name}
                        active={currentActive === mod.name}
                        isCollapsed={isCollapsed}
                        color={mod.color}
                        onClick={() => switchView(mod.name)} // Envoie le nom exact au dictionnaire du Dashboard
                    />
                  ))
                ) : (
                  !isCollapsed && (
                      <div className="mx-2 p-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center text-center">
                          <p className="text-[9px] text-slate-400 font-medium italic">Aucune extension active</p>
                      </div>
                  )
                )}
            </div>
          </div>
        </nav>

        {/* FOOTER */}
        <div className="mt-auto border-t border-slate-100 p-4 space-y-1 bg-slate-50/30">
          <NavItem icon={<Settings size={18} />} label="Configuration" isCollapsed={isCollapsed} onClick={() => {}} />
          <button onClick={handleLogout} className={`group flex w-full items-center gap-3 rounded-xl p-2.5 text-xs font-black uppercase text-rose-500 transition-all hover:bg-rose-50 ${isCollapsed ? "justify-center" : "justify-start"}`}>
            <LogOut size={18} className="transition-transform group-hover:-translate-x-1" />
            {!isCollapsed && <span className="tracking-tight">Déconnexion</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active, isCollapsed, onClick, color }: any) {
  return (
    <button onClick={onClick} className={`group w-full flex items-center rounded-xl p-2.5 transition-all duration-300 relative ${active ? "bg-slate-900 text-white shadow-lg shadow-slate-200" : "text-slate-500 hover:bg-white hover:text-indigo-600"} ${isCollapsed ? "justify-center" : "justify-start"}`}>
      <div className={`flex items-center gap-3 ${isCollapsed ? "" : "w-full"}`}>
        <span className="shrink-0 transition-colors" style={!active && color ? { color: color } : {}}>{icon}</span>
        {!isCollapsed && <span className="text-[11px] font-black uppercase tracking-tight truncate flex-1 text-left">{label}</span>}
        {active && !isCollapsed && <ChevronRight size={12} className="opacity-40" />}
      </div>
      {isCollapsed && (
        <div className="absolute left-full ml-4 rounded bg-slate-900 px-2 py-1 text-[10px] font-bold text-white opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">{label}</div>
      )}
    </button>
  );
}