"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ShieldAlert,
  Building2,
  Mail,
  Lock,
  Globe,
  CheckCircle2,
  Loader2,
  Fingerprint,
  ChevronDown,
} from "lucide-react";

export default function RegisterSpace() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  const router = useRouter();

  const [formData, setFormData] = useState({
    company_name: "",
    tenant_slug: "",
    admin_name: "Administrateur",
    admin_email: "",
    password: "",
    sector: "",
  });

  // --- SYNCHRONISATION DYNAMIQUE AVEC LE DISQUE DUR (BACKEND) ---
  useEffect(() => {
    async function fetchSectors() {
      try {
        const res = await api.get("/sectors");
        setAvailableSectors(res.data);
        // On auto-sélectionne le premier secteur trouvé s'il n'y a pas encore de choix
        if (res.data.length > 0 && !formData.sector) {
          setFormData((prev) => ({ ...prev, sector: res.data[0] }));
        }
      } catch (err) {
        console.error("Nexus Sync Error: Secteurs introuvables", err);
        setAvailableSectors(["Général"]);
      }
    }
    fetchSectors();
  }, []);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.admin_email);
  const isPasswordValid = formData.password.length >= 8;
  const isSlugValid =
    /^[a-z0-9-]+$/.test(formData.tenant_slug) &&
    formData.tenant_slug.length >= 3;

  const canGoToStep2 =
    formData.company_name.length >= 3 && isSlugValid && formData.sector !== "";
  const canSubmit = isEmailValid && isPasswordValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Envoi au moteur de provisioning
      const res = await api.post("/tenants/provision", formData);
      // Redirection immédiate vers l'instance créée
      router.push(`/login?tenant=${res.data.tenant}`);
    } catch (err: any) {
      alert(
        "Échec de propulsion : " +
          (err.response?.data?.message || "Erreur système."),
      );
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] p-4 font-sans text-white">
      {/* EFFETS VISUELS NEXUS */}
      <div className="pointer-events-none absolute top-[-100px] left-[-100px] h-[600px] w-[600px] bg-purple-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-100px] bottom-[-100px] h-[500px] w-[500px] bg-blue-600/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-[450px]">
        {/* INDICATEUR D'ÉTAPE */}
        <div className="mb-10 flex items-center justify-between px-2">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black transition-all duration-500 ${
                  step >= s
                    ? "bg-linear-to-br from-purple-600 to-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                    : "border border-white/10 bg-[#111] text-gray-600"
                }`}
              >
                {step > s ? <CheckCircle2 size={16} /> : s}
              </div>
              <span
                className={`text-[10px] font-bold tracking-widest uppercase ${step >= s ? "text-white" : "text-gray-600"}`}
              >
                {s === 1 ? "Organisation" : "Sécurité"}
              </span>
            </div>
          ))}
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative overflow-hidden rounded-[40px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl"
        >
          <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]" />

          {/* ÉTAPE 1 : INFRASTRUCTURE & MÉTIER */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 relative z-20 duration-500">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-bold tracking-tight uppercase">
                <Building2 className="text-purple-400" size={20} /> Nexus Finder
              </h2>

              <div className="space-y-4">
                <input
                  type="text"
                  required
                  placeholder="Nom de l'entreprise / Organisation"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 transition-all outline-none placeholder:text-gray-600 focus:border-purple-500/50"
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                />

                <div className="relative">
                  <Fingerprint
                    className="absolute top-4 left-4 text-gray-600"
                    size={18}
                  />
                  <input
                    type="text"
                    required
                    placeholder="identifiant-instance"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 pl-12 transition-all outline-none placeholder:text-gray-600 focus:border-purple-500/50"
                    value={formData.tenant_slug}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tenant_slug: e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, ""),
                      })
                    }
                  />
                  <span className="absolute top-5 right-4 font-mono text-[9px] text-gray-500">
                    .nexus-os.com
                  </span>
                </div>

                {/* SÉLECTEUR DE SECTEUR DYNAMIQUE */}
                <div className="relative">
                  <Globe
                    className="absolute top-4 left-4 text-gray-600"
                    size={18}
                  />
                  <select
                    className="w-full cursor-pointer appearance-none rounded-2xl border border-white/10 bg-white/5 p-4 pl-12 outline-none focus:border-purple-500/50"
                    value={formData.sector}
                    onChange={(e) =>
                      setFormData({ ...formData, sector: e.target.value })
                    }
                  >
                    <option value="" disabled>
                      Choisir un secteur d'activité
                    </option>
                    {availableSectors.map((sector) => (
                      <option
                        key={sector}
                        value={sector}
                        className="bg-[#0f0f0f]"
                      >
                        Secteur : {sector.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute top-4 right-4 text-gray-600"
                    size={18}
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={!canGoToStep2}
                onClick={() => setStep(2)}
                className="mt-8 w-full rounded-2xl bg-white p-4 text-xs font-bold tracking-widest text-black uppercase transition-all hover:bg-purple-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
              >
                Continuer
              </button>
            </div>
          )}

          {/* ÉTAPE 2 : ACCÈS MAÎTRE */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 relative z-20 duration-500">
              <h2 className="mb-6 flex items-center gap-2 text-xl font-bold tracking-tight uppercase">
                <Lock className="text-purple-400" size={20} /> Accès Maître
              </h2>

              <div className="space-y-4">
                <div className="relative">
                  <Mail
                    className="absolute top-4 left-4 text-gray-600"
                    size={18}
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email de l'administrateur"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 pl-12 outline-none placeholder:text-gray-600 focus:border-purple-500/50"
                    value={formData.admin_email}
                    onChange={(e) =>
                      setFormData({ ...formData, admin_email: e.target.value })
                    }
                  />
                </div>

                <div className="relative">
                  <input
                    type="password"
                    required
                    placeholder="Mot de passe (8+ caractères)"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 outline-none placeholder:text-gray-600 focus:border-purple-500/50"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <div className="absolute top-4 right-4">
                    {isPasswordValid ? (
                      <ShieldCheck className="text-green-400" size={20} />
                    ) : (
                      <ShieldAlert className="text-orange-400" size={20} />
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs tracking-widest uppercase transition-all hover:bg-white/10"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading || !canSubmit}
                  className="flex flex-2 items-center justify-center gap-2 rounded-2xl bg-purple-600 p-4 text-xs font-bold tracking-widest text-white uppercase transition-all hover:bg-purple-500"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    "Propulser l'instance"
                  )}
                </button>
              </div>
            </div>
          )}

          <p className="relative z-20 mt-8 text-center text-[9px] font-bold tracking-[0.3em] text-gray-600 uppercase opacity-50">
            Nexus Engine EaaS v2.0 • Propulsion System
          </p>
        </form>
      </div>
    </div>
  );
}
