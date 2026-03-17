from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import random

app = FastAPI(
    title="Nexus AI Service",
    description="Cerveau central de l'écosystème Nexus EaaS - Authentification & Provisionnement",
    version="1.5.0"
)

# Configuration CORS pour autoriser Laravel (Backend) et Next.js (Frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODÈLES DE DONNÉES ---

class TenantAnalysisQuery(BaseModel):
    tenant_name: str

class WelcomeQuery(BaseModel):
    company_name: str
    sector: str

class AuthInsightQuery(BaseModel):
    status: str  # 'success' ou 'error'
    tenant: str
    sector: str = "general"

# --- ROUTES ---

@app.get("/")
def health_check():
    return {
        "status": "online", 
        "engine": "Nexus-Core-AI", 
        "version": "1.5.0",
        "mode": "EaaS-B2B-Infrastructure"
    }

# ÉTAPE 1 : ANALYSE PRÉ-INSCRIPTION (Nexus Finder)
@app.post("/analyze-tenant")
async def analyze_tenant(data: TenantAnalysisQuery):
    try:
        name = data.tenant_name.strip()
        if len(name) < 2:
            raise HTTPException(status_code=400, detail="Identifiant trop court")

        return {
            "status": "success",
            "analysis": f"Nexus OS : L'identifiant '{name}' est prêt pour le provisionnement.",
            "metadata": {"status": "ready", "engine": "Nexus-Validator-V1"}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ÉTAPE 2 : MESSAGE DE BIENVENUE APRÈS REGISTER
@app.post("/generate-welcome")
async def generate_welcome(data: WelcomeQuery):
    try:
        name = data.company_name
        sector = data.sector.lower()

        insights = {
            "education": f"Félicitations ! L'écosystème éducatif de {name} est maintenant propulsé par Nexus. Vos modules de gestion académique sont en cours d'initialisation.",
            "sante": f"Instance Santé activée pour {name}. Votre infrastructure sécurisée est prête pour la gestion des données.",
            "tech": f"Nexus Core déployé avec succès pour {name}. Vos environnements IA sont prêts.",
            "general": f"Propulsion réussie pour {name} ! Votre espace Nexus OS est configuré."
        }
        
        return {
            "status": "success", 
            "message": insights.get(sector, insights["general"])
        }
    except Exception as e:
        return {"status": "error", "message": f"Bienvenue chez Nexus, {name}!"}

# ÉTAPE 3 : INTELLIGENCE D'AUTHENTIFICATION (LOGIN)
@app.post("/generate-auth-insight")
async def generate_auth_insight(data: AuthInsightQuery):
    """Génère un message dynamique pour la popup de login"""
    tenant = data.tenant
    sector = data.sector.lower()

    if data.status == "error":
        error_messages = [
            f"Le Nexus Core ne détecte aucune signature pour l'instance '{tenant}'. Accès refusé.",
            f"Anomalie d'identification. Les protocoles de sécurité de {tenant} rejettent ces accès.",
            f"Échec de liaison. Aucun utilisateur correspondant trouvé dans le secteur {sector}.",
            "Signature biométrique/mot de passe non reconnus par le firewall Nexus."
        ]
        return {"insight": random.choice(error_messages)}
    
    else:
        success_messages = [
            f"Authentification validée. Synchronisation des modules {sector} pour {tenant}...",
            f"Bienvenue. L'écosystème de {tenant} est désormais sous votre contrôle.",
            f"Nexus OS activé. Accès total accordé aux serveurs de {tenant}.",
            "Tunnel sécurisé établi. Chargement du Dashboard en cours..."
        ]
        return {"insight": random.choice(success_messages)}

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)