from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os

app = FastAPI(
    title="Nexus AI Service",
    description="Validateur d'instance pour l'écosystème EaaS Nexus",
    version="1.3.0"
)

# Configuration CORS pour Railway (Backend Laravel) & Vercel (Frontend Next.js)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TenantAnalysisQuery(BaseModel):
    tenant_name: str

@app.get("/")
def health_check():
    return {
        "status": "online", 
        "engine": "Nexus-Core-Validator", 
        "version": "1.3.0",
        "mode": "EaaS-B2B-Infrastructure"
    }

@app.post("/analyze-tenant")
async def analyze_tenant(data: TenantAnalysisQuery):
    try:
        # 1. Nettoyage du nom reçu
        name = data.tenant_name.strip()
        
        if len(name) < 2:
            raise HTTPException(status_code=400, detail="Identifiant d'instance trop court")

        # --- LOGIQUE NEUTRE & PROFESSIONNELLE ---
        # On supprime le mapping sémantique pour éviter les erreurs de "magie"
        # On se concentre sur la validation de la future infrastructure
        
        message = f"Nexus OS : L'identifiant '{name}' est disponible pour le provisionnement. Veuillez configurer le type d'entité pour finaliser l'instance."

        return {
            "status": "success",
            "analysis": message,
            "suggested_module": "Configuration Manuelle Requise",
            "metadata": {
                "tenant_received": name,
                "status": "ready_for_provisioning",
                "confidence_score": 1.0, # 100% sûr car on ne devine rien
                "engine": "Nexus-Validator-V1"
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Port dynamique pour le déploiement sur Railway
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)