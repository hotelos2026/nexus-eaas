'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api"; // Assure-toi que ce chemin est correct
import {
  Users,
  Settings,
  LogOut,
  Rocket,
  X,
  Store,
  Loader2,
} from "lucide-react";
import { DynamicIcon } from "@/components/DynamicIcon"; // Utilisation de ton composant d'icônes dynamiques

interface SubscribedModule {
  id: string;
  name: string;
  icon: string;
  color: string;
  is_subscribed: boolean;
}

export default function Sidebar({
  isMobileOpen,
  setMobileOpen,
  isCollapsed,
}: any) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenant = searchParams.get('tenant');
  
  const [subscribedModules, setSubscribedModules] = useState<SubscribedModule[]>([]);
  const [loading, setLoading] = useState(true);

  // Chargement des modules souscrits
  useEffect(() => {
    const fetchSubscribedModules = async () => {
      try {
        setLoading(true);
        const res = await api.get('/nexus/modules', { 
          headers: { 'X-Tenant': tenant || 'guest' } 
        });
        const allModules = Array.isArray(res.data) ? res.data : (res.data.modules || []);
        // Filtrer uniquement les modules payés/activés
        const active = allModules.filter((m: SubscribedModule) => m.is_subscribed === true);
        setSubscribedModules(active);
      } catch (e) {
        console.error("Erreur chargement modules sidebar:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscribedModules();
  }, [tenant]);

  const handleLogout = async () => {
    const token = localStorage.getItem("nexus_token") || localStorage.getItem("user_token");
    const tenantSlug = localStorage.getItem("current_tenant") || localStorage.getItem("tenant_slug");

    try {
      if (token && tenantSlug) {
        await fetch(`https://backend-nexus.up.railway.app/api/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Erreur déconnexion API:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      if (tenantSlug) {
        localStorage.setItem("current_tenant", tenantSlug);
        window.location.href = `/login?tenant=${tenantSlug}`;
      } else {
        window.location.href = "/login";
      }
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 transform border-r border-slate-200 bg-white transition-all duration-300 lg:static ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"} ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}
    >
      <div className="flex h-full flex-col overflow-hidden">
        {/* Logo Section */}
        <div className={`flex items-center p-6 ${isCollapsed ? "justify-center" : "justify-between"}`}>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 shadow-lg shadow-indigo-200">
              <Rocket className="h-5 w-5 text-white" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-bold tracking-tight whitespace-nowrap text-slate-900 uppercase">
                NEXUS
              </span>
            )}
          </div>
          <button className="text-slate-500 lg:hidden" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Menu Navigation */}
        <nav className="scrollbar-hide mt-4 flex-1 space-y-1 overflow-y-auto px-4">
          <div className="mb-4">
             <p className={`text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ${isCollapsed ? "text-center" : "ml-2"}`}>
                Menu Principal
             </p>
             <NavItem
                icon={<Store size={20} />}
                label="App Store"
                active
                isCollapsed={isCollapsed}
                onClick={() => router.push(`/dashboard?tenant=${tenant}`)}
              />
              <NavItem
                icon={<Users size={20} />}
                label="Utilisateurs"
                isCollapsed={isCollapsed}
              />
          </div>

          {/* SECTION DYNAMIQUE : MODULES ACHETÉS */}
          <div className="pt-4 border-t border-slate-50">
            <p className={`text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ${isCollapsed ? "text-center" : "ml-2"}`}>
              Mes Modules
            </p>
            
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 size={16} className="animate-spin text-slate-300" />
              </div>
            ) : subscribedModules.length > 0 ? (
              subscribedModules.map((mod) => (
                <NavItem
                  key={mod.id}
                  icon={<DynamicIcon name={mod.icon} size={20} />}
                  label={mod.name}
                  isCollapsed={isCollapsed}
                  color={mod.color}
                />
              ))
            ) : (
              !isCollapsed && (
                <p className="text-[10px] text-slate-400 italic px-2 py-2 text-center bg-slate-50 rounded-lg">
                  Aucun module actif
                </p>
              )
            )}
          </div>
        </nav>

        {/* Settings & Logout */}
        <div className="space-y-2 border-t border-slate-100 p-4">
          <NavItem
            icon={<Settings size={20} />}
            label="Paramètres"
            isCollapsed={isCollapsed}
          />
          <button
            onClick={handleLogout}
            className={`group flex w-full items-center gap-3 rounded-xl p-2.5 text-sm font-bold text-red-500 transition-all hover:bg-red-50 ${isCollapsed ? "justify-center" : "justify-start"}`}
          >
            <LogOut size={20} className="transition-transform group-hover:-translate-x-1" />
            {!isCollapsed && <span>Quitter</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active, isCollapsed, onClick, color }: any) {
  return (
    <div
      onClick={onClick}
      className={`group flex cursor-pointer items-center rounded-xl p-2.5 transition-all duration-200 ${
        active 
          ? "border border-indigo-100/50 bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100" 
          : "border border-transparent text-slate-600 hover:bg-slate-50"
      } ${isCollapsed ? "justify-center" : "justify-start"}`}
    >
      <div className="flex items-center gap-3 overflow-hidden">
        <span
          className={`${active ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-600"}`}
          style={!active && color ? { color: color } : {}}
          title={isCollapsed ? label : ""}
        >
          {icon}
        </span>
        {!isCollapsed && (
          <span className="text-[13px] font-bold tracking-tight whitespace-nowrap truncate">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}