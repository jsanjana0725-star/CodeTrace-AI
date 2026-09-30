# CodeTrace AI backend v2

## Run locally

```powershell
cd server
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

The frontend uses `VITE_API_URL` and defaults to `http://localhost:8000`.

### What changed
- One FastAPI pipeline owns GitHub access; the browser no longer calls GitHub directly.
- Uses GitHub's recursive tree endpoint to reduce API calls.
- Reads manifests and key source files from `raw.githubusercontent.com`.
- Detects technologies from actual dependency/config evidence.
- Builds import-based file relationships for TS/JS/Python.
- Gemini receives repository evidence rather than only filenames.
- Ask AI uses the backend API.
- Works without GitHub/Gemini secrets using evidence-based local analysis; secrets only enhance the analysis.
