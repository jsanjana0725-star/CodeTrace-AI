"""CodeTrace AI FastAPI service."""
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from .analyzer import analyze_repository, answer_question, github_token_configured

load_dotenv()
app = FastAPI(title="CodeTrace AI API", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=[x.strip() for x in os.getenv("CORS_ORIGINS", "*").split(",")], allow_methods=["GET","POST","OPTIONS"], allow_headers=["*"])

class AnalyzeRequest(BaseModel):
    repo_url: str = Field(..., min_length=3)
class AskRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    repo_url: str = Field(..., min_length=3)

@app.get("/health")
async def health():
    return {"status":"ok","service":"CodeTrace AI API","version":"2.0.0","github_token_configured":github_token_configured(),"gemini_configured":bool(os.getenv("GEMINI_API_KEY"))}

@app.post("/api/analyze")
async def analyze(req: AnalyzeRequest):
    try: return await analyze_repository(req.repo_url)
    except ValueError as e: raise HTTPException(400, str(e))
    except RuntimeError as e: raise HTTPException(502, str(e))

@app.post("/api/ask")
async def ask(req: AskRequest):
    try: return {"answer": await answer_question(req.question, req.repo_url)}
    except ValueError as e: raise HTTPException(400, str(e))
    except RuntimeError as e: raise HTTPException(502, str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.environ.get("PORT",8000)))
