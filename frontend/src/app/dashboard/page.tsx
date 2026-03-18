'use client';

import { useEffect, useState, Suspense } from 'react';
import api from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard, Database, Bot, Users,
  Settings, LogOut, Rocket, BarChart3
} from 'lucide-react';

function DashboardContent() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const searchParams = useSearchParams();
  const tenant =
    searchParams.get('tenant') ||
    (typeof window !== 'undefined'
      ? localStorage.getItem('current_tenant')
      : null);

  useEffect(() => {
    const token = localStorage.getItem('nexus_token');

    if (!token) {
      router.push(`/login?tenant=${tenant || ''}`);
      return;
    }

    const fetchData = async () => {
      try {
        // On passe le tenant en paramètre ou en Header (selon ton choix Backend)
        const res = await api.get(`/test-ai?tenant=${tenant}`); 
        setData(res.data);
      } catch (err) {
        console.error("Session Nexus expirée ou invalide");
        router.push(`/login?tenant=${tenant}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tenant, router]);

  const logout = () => {
    localStorage.clear();
    router.push(`/login?tenant=${tenant}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0a0a0f] text-white">
        <div className="animate-spin w-10 h-10 border-2 border-purple-500/30 border-t-purple-500 rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#0a0a0f] text-white">

      {/* SIDEBAR */}
      <aside className="w-64 border-r border-white/5 bg-[#0f0f14] p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-10">
            <Rocket className="text-purple-500" />
            <span className="font-bold">NEXUS</span>
          </div>

          <nav className="space-y-3 text-sm">
            <NavItem icon={<LayoutDashboard size={16}/>} label="Dashboard" />
            <NavItem icon={<BarChart3 size={16}/>} label="Analytics" />
            <NavItem icon={<Database size={16}/>} label="Data" />
            <NavItem icon={<Users size={16}/>} label="Users" />
            <NavItem icon={<Bot size={16}/>} label="AI Copilot" />
            <NavItem icon={<Settings size={16}/>} label="Settings" />
          </nav>
        </div>

        <button onClick={logout} className="text-sm text-slate-400 hover:text-white">
          <LogOut size={16} /> Déconnexion
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-slate-500 text-sm">
              Workspace : <span className="text-purple-400">{tenant}</span>
            </p>
          </div>
        </div>

        {/* KPI */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card title="Modules actifs" value="3" />
          <Card title="Utilisateurs" value="12" />
          <Card title="Requêtes AI" value="1.2K" />
        </div>

        {/* MODULES */}
        <h2 className="text-lg font-semibold mb-4">Modules</h2>

        <div className="grid md:grid-cols-3 gap-6">

          <ModuleCard
            title="CRM"
            desc="Gestion clients"
            active
          />

          <ModuleCard
            title="Finance"
            desc="Facturation & paiements"
          />

          <ModuleCard
            title="Analytics"
            desc="Statistiques avancées"
          />

        </div>

        {/* AI STATUS */}
        <div className="mt-10 p-6 rounded-2xl bg-[#111118] border border-white/5">
          <h3 className="font-semibold mb-2">Nexus AI</h3>
          <p className="text-sm text-slate-400">
            {data?.ai_response?.status || "Actif"}
          </p>
        </div>

      </main>
    </div>
  );
}

/* COMPONENTS */

function NavItem({ icon, label }: any) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer">
      {icon}
      {label}
    </div>
  );
}

function Card({ title, value }: any) {
  return (
    <div className="p-6 rounded-xl bg-[#111118] border border-white/5">
      <p className="text-xs text-slate-500">{title}</p>
      <h3 className="text-xl font-bold">{value}</h3>
    </div>
  );
}

function ModuleCard({ title, desc, active }: any) {
  return (
    <div className="p-6 rounded-xl bg-[#111118] border border-white/5 hover:border-purple-500/30 transition">
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-xs text-slate-500 mb-4">{desc}</p>

      <button className={`text-xs px-3 py-1 rounded-lg ${
        active ? 'bg-green-500/20 text-green-400' : 'bg-purple-600'
      }`}>
        {active ? 'Actif' : 'Activer'}
      </button>
    </div>
  );
}

/* EXPORT */
export default function Dashboard() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f]" />}>
      <DashboardContent />
    </Suspense>
  );
}