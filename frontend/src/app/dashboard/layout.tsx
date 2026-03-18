'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Loader2, ShieldCheck } from 'lucide-react';

// Force Next.js à traiter cette route comme dynamique pour éviter les erreurs de build statique
export const dynamic = 'force-dynamic';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // États pour le contrôle de l'UI
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const urlTenant = searchParams.get('tenant');

  useEffect(() => {
    const token = localStorage.getItem('nexus_token');
    const storedTenant = localStorage.getItem('current_tenant');

    // Vérification de sécurité stricte
    if (!token) {
      const redirectPath = urlTenant ? `/login?tenant=${urlTenant}` : '/login';
      window.location.href = redirectPath;
      return;
    }

    // Si un tenant est dans l'URL mais ne correspond pas au token stocké
    if (urlTenant && storedTenant && urlTenant !== storedTenant) {
      localStorage.removeItem('nexus_token');
      localStorage.removeItem('current_tenant');
      window.location.href = `/login?tenant=${urlTenant}`;
      return;
    }

    setIsAuthorized(true);
  }, [urlTenant]);

  if (!isAuthorized) {
    return (
      <div className="h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <div className="relative flex flex-col items-center">
          <ShieldCheck size={48} className="text-indigo-500 mb-4 animate-pulse" />
          <div className="absolute -top-1 -right-1">
            <Loader2 className="animate-spin text-indigo-300" size={20} />
          </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mt-4">Vérification Nexus OS...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 font-sans overflow-hidden">
      {/* Sidebar pilotée par le Layout */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        isMobileOpen={isMobileSidebarOpen} 
        setMobileOpen={setMobileSidebarOpen} 
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header piloté par le Layout */}
        <Header 
          isSidebarCollapsed={isSidebarCollapsed} 
          setSidebarCollapsed={setSidebarCollapsed} 
          setMobileSidebarOpen={setMobileSidebarOpen} 
        />

        {/* Contenu dynamique (tes pages comme l'App Store) */}
        <main className="flex-1 overflow-y-auto scrollbar-hide">
          {children}
        </main>
      </div>
    </div>
  );
}

// Wrapper principal avec Suspense pour corriger l'erreur Vercel
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    }>
      <DashboardLayoutContent>
        {children}
      </DashboardLayoutContent>
    </Suspense>
  );
}