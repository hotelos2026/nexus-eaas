"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Loader2 } from "lucide-react";
import { HeaderProvider, useHeader } from "@/context/HeaderContext";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { headerExtra } = useHeader(); // Récupère l'extra via Context
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("nexus_token");
    if (!token) {
      router.push(searchParams.get("tenant") ? `/login?tenant=${searchParams.get("tenant")}` : "/login");
      return;
    }
    setIsAuthorized(true);
  }, [router, searchParams]);

  if (!isAuthorized) return <div className="h-screen flex items-center justify-center bg-slate-900"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>;

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8FAFC]">
      <Sidebar isCollapsed={isSidebarCollapsed} isMobileOpen={isMobileSidebarOpen} setMobileOpen={setMobileSidebarOpen} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header 
          isSidebarCollapsed={isSidebarCollapsed} 
          setSidebarCollapsed={setSidebarCollapsed} 
          setMobileSidebarOpen={setMobileSidebarOpen} 
          extraContent={headerExtra} 
        />
        <main className="flex-1 overflow-y-auto scrollbar-hide bg-[#F8FAFC]">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <HeaderProvider>
      <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>}>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </Suspense>
    </HeaderProvider>
  );
}