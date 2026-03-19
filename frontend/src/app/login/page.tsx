"use client";

import { useState, Suspense, useEffect } from "react";
import api from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import AiNotification from "@/components/AiNotification";
import { Mail, Lock, Loader2, ShieldCheck, ShieldAlert } from "lucide-react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTenant, setActiveTenant] = useState<string | null>(null);

  const [notif, setNotif] = useState({
    show: false,
    msg: "",
    type: "ai" as "ai" | "error" | "success",
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  // --- LOGIQUE DE DÉTECTION DU TENANT ---
  // --- LOGIQUE DE DÉTECTION ET VALIDATION DU TENANT ---
  useEffect(() => {
    const verifyAndSetTenant = async (slug: string) => {
      try {
        // On vérifie si le node existe VRAIMENT dans le Nexus (BDD)
        const res = await api.get(`/check-tenant/${slug}`);

        if (res.data.exists) {
          setActiveTenant(slug.toLowerCase());
          localStorage.setItem("current_tenant", slug.toLowerCase());
        }
      } catch (err) {
        // Si le backend répond 404, on invalide tout
        setActiveTenant(null);
        localStorage.removeItem("current_tenant");
        triggerAiNotif(`Le node [${slug}] est inconnu ou désactivé.`, "error");
      }
    };

    const queryTenant = searchParams.get("tenant");

    if (queryTenant) {
      verifyAndSetTenant(queryTenant);
    } else {
      // Détection par sous-domaine
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      if (parts.length > (hostname.includes("localhost") ? 1 : 2)) {
        const subdomain = parts[0];
        if (!["www", "api", "nexus-eaas", "nexus"].includes(subdomain)) {
          verifyAndSetTenant(subdomain);
        }
      }
    }
  }, [searchParams]);

  const isPasswordValid = password.length >= 8;

  const triggerAiNotif = (msg: string, type: "ai" | "error" | "success") => {
    setNotif({ show: true, msg, type });
    if (type !== "error") {
      setTimeout(() => setNotif((prev) => ({ ...prev, show: false })), 4500);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeTenant) {
      triggerAiNotif(
        "Instance Nexus introuvable. Identifiant d'instance requis.",
        "error",
      );
      return;
    }

    setLoading(true);

    try {
      // L'appel utilise l'intercepteur de lib/api.js qui injecte X-Tenant
      const res = await api.post("/login", {
        email,
        password,
        tenant: activeTenant,
      });

      const token = res.data.access_token;

      triggerAiNotif(
        `Authentification réussie. Synchronisation avec ${activeTenant}...`,
        "success",
      );

      // Stockage des clés d'accès
      localStorage.setItem("nexus_token", token);
      localStorage.setItem("current_tenant", activeTenant);

      setTimeout(() => {
        router.push(`/dashboard?tenant=${activeTenant}`);
      }, 1200);
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Échec de l'authentification Nexus";
      triggerAiNotif(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] p-4 font-sans text-white">
      {/* EFFETS DE FOND DYNAMIQUES */}
      <div className="pointer-events-none absolute top-[-100px] left-[-100px] h-[600px] w-[600px] animate-pulse bg-purple-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-100px] bottom-[-100px] h-[500px] w-[500px] bg-blue-600/10 blur-[120px]" />

      <AiNotification
        isVisible={notif.show}
        message={notif.msg}
        type={notif.type}
        onClose={() => setNotif((prev) => ({ ...prev, show: false }))}
      />

      <div className="relative z-10 w-full max-w-[420px]">
        <form
          onSubmit={handleLogin}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/3 p-8 shadow-[0_0_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:p-10"
        >
          {/* Grain de texture overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />

          <div className="relative z-20 mb-10 text-center">
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">
              NEXUS<span className="text-purple-500">OS</span>
            </h1>

            <div className="mt-4 flex items-center justify-center gap-2">
              <div
                className={`h-1.5 w-1.5 rounded-full ${activeTenant ? "animate-ping bg-green-500" : "bg-red-500"}`}
              />
              <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase">
                Node:{" "}
                <span className="text-purple-400">
                  {activeTenant ? `${activeTenant}.network` : "OFFLINE"}
                </span>
              </p>
            </div>
          </div>

          <div className="relative z-20 space-y-4">
            <div className="group relative">
              <Mail
                className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-purple-400"
                size={18}
              />
              <input
                type="email"
                required
                placeholder="Identifiant de l'agent"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-white/5 bg-black/40 py-4 pr-4 pl-12 transition-all placeholder:text-gray-700 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 focus:outline-none"
              />
            </div>

            <div className="group relative">
              <Lock
                className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-purple-400"
                size={18}
              />
              <input
                type="password"
                required
                placeholder="Clé de sécurité"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/5 bg-black/40 py-4 pr-12 pl-12 transition-all placeholder:text-gray-700 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 focus:outline-none"
              />
              <div className="absolute top-1/2 right-4 -translate-y-1/2">
                {isPasswordValid ? (
                  <ShieldCheck className="text-green-500/50" size={18} />
                ) : (
                  <ShieldAlert className="text-orange-500/30" size={18} />
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !activeTenant}
            className="group relative mt-8 w-full overflow-hidden rounded-2xl bg-white py-4 text-xs font-black tracking-widest text-black uppercase transition-all duration-300 hover:bg-purple-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Vérifier l'empreinte"
              )}
            </span>
          </button>

          {!activeTenant && (
            <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-center">
              <p className="text-[9px] leading-relaxed font-bold text-red-400 uppercase">
                Erreur critique : Aucune instance Nexus détectée via URL ou
                domaine.
              </p>
            </div>
          )}

          <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-6 opacity-40">
            <p className="text-[8px] font-bold tracking-widest uppercase">
              Encrypted Node
            </p>
            <p className="text-[8px] font-bold tracking-widest text-purple-500 uppercase">
              v2.0.4
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#050505]">
          <Loader2 className="animate-spin text-purple-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
