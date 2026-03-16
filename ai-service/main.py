from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Nexus AI Service")

# Structure des données reçues (ex: une requête de l'utilisateur)
class AIQuery(BaseModel):
    prompt: str
    user_id: int

@app.get("/")
def read_root():
    return {"status": "AI Service is Online", "version": "1.0.0"}

@app.post("/analyze")
async def analyze_text(data: AIQuery):
    # C'est ici que nous intégrerons plus tard ton modèle (OpenAI, HuggingFace, etc.)
    result = f"L'IA a analysé votre demande : '{data.prompt}' pour l'utilisateur {data.user_id}"
    
    return {
        "status": "success",
        "analysis": result,
        "engine": "EaaS-Engine-01"
    }