from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import random
from typing import List

app = FastAPI(
    title="Nexus AI Service",
    description="Cerveau central Nexus EaaS - Intelligence Métier + Provisionnement",
    version="2.0.0"
)

# 🌐 CORS (production: restreindre domaines)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================
# 📦 MODELS
# ================================

class TenantAnalysisQuery(BaseModel):
    tenant_name: str

class WelcomeQuery(BaseModel):
    company_name: str
    sector: str

class AuthInsightQuery(BaseModel):
    status: str
    tenant: str
    sector: str = "general"

class ModuleQuery(BaseModel):
    sector: str

class SystemInitQuery(BaseModel):
    company_name: str
    sector: str


# ================================
# 🧠 CORE DATA (ERP BRAIN)
# ================================

SECTOR_MODULES = {
    "retail": ["stocks", "ventes", "clients", "caisse"],
    "transport": ["flotte", "trajets", "maintenance", "logistique"],
    "education": ["étudiants", "cours", "examens", "planning"],
    "sante": ["patients", "rdv", "dossiers", "facturation"],
    "tech": ["projets", "dev", "api", "monitoring"],
    "restaurant": ["menus", "commandes", "tables", "livraison"],
    "general": ["dashboard", "utilisateurs", "facturation"]
}

# ================================
# 🧪 HEALTH CHECK
# ================================

@app.get("/")
def health_check():
    return {
        "status": "online",
        "engine": "Nexus-Core-AI",
        "version": "2.0.0",
        "mode": "EaaS-Orchestrator"
    }

# ================================
# 🔍 ANALYSE TENANT
# ================================

@app.post("/analyze-tenant")
async def analyze_tenant(data: TenantAnalysisQuery):
    name = data.tenant_name.strip()

    if len(name) < 2:
        raise HTTPException(status_code=400, detail="Nom trop court")

    return {
        "status": "success",
        "analysis": f"L'identifiant '{name}' est disponible.",
        "metadata": {
            "status": "ready",
            "engine": "Nexus-Validator-V2"
        }
    }

# ================================
# 🏗️ MODULE GENERATOR
# ================================

@app.post("/generate-modules")
async def generate_modules(data: ModuleQuery):
    sector = data.sector.lower()

    modules = SECTOR_MODULES.get(sector, SECTOR_MODULES["general"])

    return {
        "status": "success",
        "sector": sector,
        "modules": modules
    }

# ================================
# 🚀 SYSTEM INIT (ULTRA IMPORTANT)
# ================================

@app.post("/init-system")
async def init_system(data: SystemInitQuery):
    sector = data.sector.lower()
    modules = SECTOR_MODULES.get(sector, SECTOR_MODULES["general"])

    return {
        "status": "success",
        "company": data.company_name,
        "sector": sector,
        "modules": modules,
        "database": f"{data.company_name.lower()}_db",
        "message": f"Système prêt pour {data.company_name}"
    }

# ================================
# 🎉 WELCOME MESSAGE
# ================================

@app.post("/generate-welcome")
async def generate_welcome(data: WelcomeQuery):
    name = data.company_name
    sector = data.sector.lower()

    messages = {
        "education": f"{name} est prêt avec son système éducatif.",
        "sante": f"{name} dispose maintenant d'une infrastructure santé sécurisée.",
        "tech": f"{name} est prêt pour le développement et l'IA.",
        "retail": f"{name} peut maintenant gérer ses ventes et stocks efficacement.",
        "transport": f"{name} peut suivre sa flotte et optimiser ses trajets.",
        "general": f"{name} est prêt à utiliser Nexus."
    }

    return {
        "status": "success",
        "message": messages.get(sector, messages["general"])
    }

# ================================
# 🔐 AUTH INSIGHT
# ================================

@app.post("/generate-auth-insight")
async def generate_auth_insight(data: AuthInsightQuery):
    tenant = data.tenant
    sector = data.sector.lower()

    if data.status == "error":
        return {
            "insight": random.choice([
                f"Accès refusé pour {tenant}.",
                f"Erreur d'identification.",
                f"Aucun utilisateur trouvé.",
                "Authentification invalide."
            ])
        }

    return {
        "insight": random.choice([
            f"Connexion réussie pour {tenant}.",
            f"Bienvenue dans votre espace.",
            f"Système {sector} chargé.",
            "Accès validé."
        ])
    }

# ================================
# 🧠 SMART BUSINESS ANALYSIS (NEW)
# ================================

@app.post("/analyze-business")
async def analyze_business(data: ModuleQuery):
    sector = data.sector.lower()

    needs = {
        "retail": ["gestion stock", "ventes", "clients"],
        "transport": ["suivi flotte", "optimisation trajets", "maintenance"],
        "education": ["gestion étudiants", "cours", "examens"],
        "sante": ["patients", "rdv", "dossiers médicaux"]
    }

    return {
        "status": "success",
        "sector": sector,
        "needs": needs.get(sector, ["gestion", "organisation"])
    }

# ================================
# ▶️ RUN
# ================================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)