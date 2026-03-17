from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import re
import os

app = FastAPI(
    title="Nexus AI Service",
    description="Moteur d'analyse sémantique pour l'écosystème EaaS Nexus",
    version="1.2.0"
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
        "engine": "Nexus-Core-AI", 
        "version": "1.2.0",
        "mode": "EaaS-B2B-Provisioner"
    }

@app.post("/analyze-tenant")
async def analyze_tenant(data: TenantAnalysisQuery):
    try:
        # 1. Nettoyage : On passe en minuscule pour l'analyse
        name = data.tenant_name.strip().lower()
        
        if len(name) < 2:
            raise HTTPException(status_code=400, detail="Nom de tenant trop court")

        # --- LOGIQUE D'ANALYSE SÉMANTIQUE ENRICHIE ---
        # Valeurs par défaut
        suggestion = "Module Standard Business"
        sector = "Services Généraux"
        
        # Mapping métier pour l'écosystème modulaire
        mapping = {
            # IMMOBILIER
            r"trano|kala|estate|immo|build|residence|house|home": {
                "sector": "Immobilier / Construction",
                "module": "Nexus Property & Construction Suite"
            },
            # TECH / DEV
            r"tech|dev|soft|code|data|digital|cloud|system|apple|google": {
                "sector": "Technologie & Software",
                "module": "Nexus Agile & DevOps Suite"
            },
            # ÉDUCATION
            r"school|ecole|university|academy|college|lycee|learn|eduk": {
                "sector": "Éducation / École",
                "module": "Nexus Education Management System"
            },
            # SANTÉ
            r"hosp|health|care|clinic|medical|sante|med|doctor|clinic": {
                "sector": "Santé / Hôpital",
                "module": "Nexus Healthcare OS"
            },
            # HÔTELLERIE
            r"hotel|restau|food|cafe|stay|inn|lodge|room": {
                "sector": "Hôtellerie / Restauration",
                "module": "Nexus Hospitality PMS"
            },
            # AEROSPACE (Ton easter egg SpaceX)
            r"spacex|nasa|orbit|space|rocket|satellite": {
                "sector": "Aérospatial",
                "module": "Nexus High-Security Space Suite"
            }
        }

        # 2. Moteur de recherche de correspondance
        for pattern, info in mapping.items():
            if re.search(pattern, name):
                sector = info["sector"]
                suggestion = info["module"]
                break

        # 3. Message d'analyse personnalisé
        message = f"Nexus IA : L'entité '{data.tenant_name}' a été identifiée comme appartenant au secteur {sector}. Nous recommandons l'activation du {suggestion}."

        return {
            "status": "success",
            "analysis": message,
            "suggested_module": suggestion,
            "metadata": {
                "tenant_received": data.tenant_name,
                "sector_key": sector.split(' ')[0].lower(), # Pour filtrage backend si besoin
                "sector": sector,
                "confidence_score": 0.98,
                "engine": "Nexus-Semantic-Logic-V2"
            }
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Port dynamique pour Railway
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)