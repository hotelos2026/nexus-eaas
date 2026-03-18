'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
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

    // Vérification de sécurité
    if (!token || (urlTenant && urlTenant !== storedTenant)) {
      localStorage.removeItem('nexus_token');
      const redirectPath = urlTenant ? `/login?tenant=${urlTenant}` : '/login';
      window.location.href = redirectPath;
    } else {
      setIsAuthorized(true);
    }
  }, [urlTenant]);

  if (!isAuthorized) {
    return (
      <div className="h-screen bg-[#050505] flex flex-col items-center justify-center text-white">
        <ShieldCheck size={48} className="text-purple-500 mb-4 animate-pulse" />
        <Loader2 className="animate-spin text-gray-700" size={24} />
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