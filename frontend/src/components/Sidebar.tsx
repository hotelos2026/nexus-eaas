'use client';

import { useRouter } from 'next/navigation';
import { LayoutDashboard, Users, Settings, LogOut, Rocket, X, Store, GraduationCap } from 'lucide-react';

export default function Sidebar({ isMobileOpen, setMobileOpen, isCollapsed }: any) {
  const router = useRouter();

  const handleLogout = async () => {
    // 1. On récupère les informations avant de nettoyer
    const token = localStorage.getItem('nexus_token') || localStorage.getItem('user_token');
    const tenantSlug = localStorage.getItem('current_tenant') || localStorage.getItem('tenant_slug');

    try {
      if (token && tenantSlug) {
        // Appel au backend pour invalider le token côté serveur
        await fetch(`https://backend-nexus.up.railway.app/api/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });
      }
    } catch (error) {
      console.error("Erreur déconnexion API:", error);
    } finally {
      // 2. NETTOYAGE COMPLET
      localStorage.clear();
      sessionStorage.clear();

      // 3. LOGIQUE DE SÉCURITÉ & REDIRECTION
      // Si on a le slug, on le remet en cache ET on l'ajoute à l'URL 
      // pour que LoginForm (useSearchParams) le détecte.
      if (tenantSlug) {
        localStorage.setItem('current_tenant', tenantSlug);
        localStorage.setItem('tenant_slug', tenantSlug);
        
        // Redirection vers le login avec le paramètre de l'instance
        window.location.href = `/login?tenant=${tenantSlug}`;
      } else {
        // Si vraiment aucun slug n'est trouvé, retour au login neutre
        window.location.href = '/login';
      }
    }
  };

  return (
    <aside className={`fixed lg:static inset-y-0 left-0 bg-white border-r border-slate-200 z-50 transition-all duration-300 transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}>
      <div className="flex flex-col h-full overflow-hidden">
        
        {/* Logo Section */}
        <div className={`p-6 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-indigo-200 shadow-lg shrink-0">
              <Rocket className="text-white w-5 h-5" />
            </div>
            {!isCollapsed && <span className="font-bold tracking-tight text-lg whitespace-nowrap text-slate-900">NEXUS</span>}
          </div>
          <button className="lg:hidden text-slate-500" onClick={() => setMobileOpen(false)}><X size={20}/></button>
        </div>

        {/* Menu Navigation */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto mt-4 scrollbar-hide">
          <NavItem icon={<Store size={20}/>} label="App Store" active isCollapsed={isCollapsed} />
          <NavItem icon={<LayoutDashboard size={20}/>} label="Dashboard" isCollapsed={isCollapsed} />
          <NavItem icon={<GraduationCap size={20}/>} label="Scolarité" isCollapsed={isCollapsed} />
          <NavItem icon={<Users size={20}/>} label="Utilisateurs" isCollapsed={isCollapsed} />
        </nav>

        {/* Settings & Logout */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <NavItem icon={<Settings size={20}/>} label="Paramètres" isCollapsed={isCollapsed} />
          <button 
            onClick={handleLogout} 
            className={`flex items-center gap-3 p-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all w-full group ${isCollapsed ? 'justify-center' : 'justify-start'}`}
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            {!isCollapsed && <span>Quitter</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active, isCollapsed }: any) {
  return (
    <div className={`flex items-center p-2.5 rounded-xl cursor-pointer group transition-all duration-200 ${active ? 'bg-indigo-50 text-indigo-700 border border-indigo-100/50 shadow-sm shadow-indigo-100' : 'text-slate-600 hover:bg-slate-50 border border-transparent'} ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
      <div className="flex items-center gap-3">
        <span className={active ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'} title={isCollapsed ? label : ""}>
          {icon}
        </span>
        {!isCollapsed && <span className="text-[13px] font-bold whitespace-nowrap tracking-tight">{label}</span>}
      </div>
    </div>
  );
}