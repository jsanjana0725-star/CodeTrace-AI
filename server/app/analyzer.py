"""CodeTrace AI repository analyzer.

The backend is the single source of truth for GitHub access. It uses GitHub's
recursive git-tree endpoint (far fewer API calls than walking every directory),
fetches source/manifests from raw.githubusercontent.com, builds an evidence-
based dependency graph, and optionally asks Gemini for a repository-aware
summary.
"""
from __future__ import annotations

import base64
import json
import math
import os
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from typing import Any

import httpx

GITHUB_API = "https://api.github.com"
RAW_BASE = "https://raw.githubusercontent.com"
GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

LANG_COLORS = {
    "TypeScript": "#3178c6", "JavaScript": "#f1e05a", "Python": "#3572A5",
    "Java": "#b07219", "Go": "#00ADD8", "Rust": "#dea584", "C++": "#f34b7d",
    "C": "#555555", "C#": "#178600", "Ruby": "#701516", "PHP": "#4F5D95",
    "Swift": "#F05138", "Kotlin": "#A97BFF", "Dart": "#00B4AB", "HTML": "#e34c26",
    "CSS": "#563d7c", "SCSS": "#c6538c", "Shell": "#89e051", "Vue": "#41b883",
    "Svelte": "#ff3e00", "Jupyter": "#DA5B0B", "Markdown": "#083fa1",
    "JSON": "#292929", "YAML": "#cb171e", "Astro": "#ff5a03",
}

SKIP_DIRS = {"node_modules", ".git", "dist", "build", ".next", ".cache", "vendor", "__pycache__", ".venv", "venv", "env", "target", "bin", "obj", ".idea", ".vscode", "coverage", ".turbo", ".svelte-kit", ".astro"}
TEXT_EXTENSIONS = {".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".py", ".go", ".rs", ".java", ".kt", ".rb", ".php", ".cs", ".cpp", ".c", ".h", ".hpp", ".vue", ".svelte", ".astro", ".json", ".toml", ".yaml", ".yml", ".md", ".txt", ".env", ".ini"}


def parse_repo_url(url: str) -> tuple[str, str]:
    url = url.strip().rstrip("/")
    m = re.match(r"(?:https?://)?(?:www\.)?github\.com/([^/]+)/([^/#?]+?)(?:\.git)?(?:[/?#].*)?$", url, re.I)
    if m:
        return m.group(1), m.group(2)
    m = re.match(r"^([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+)$", url)
    if m:
        return m.group(1), m.group(2)
    raise ValueError("Invalid repository URL. Use github.com/owner/repo or owner/repo.")


def get_github_token() -> str | None:
    token = os.environ.get("GITHUB_TOKEN", "").strip()
    return token or None


def github_token_configured() -> bool:
    return get_github_token() is not None


def _gh_headers() -> dict[str, str]:
    h = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    if get_github_token():
        h["Authorization"] = f"Bearer {get_github_token()}"
    return h


async def _gh(client: httpx.AsyncClient, path: str) -> Any:
    r = await client.get(f"{GITHUB_API}{path}", headers=_gh_headers(), timeout=30)
    if r.status_code == 401:
        raise RuntimeError("GitHub rejected the configured GITHUB_TOKEN (401). Check or remove the token.")
    if r.status_code == 404:
        raise ValueError("Repository not found. Make sure the repository is public and the URL is correct.")
    if r.status_code == 403 and r.headers.get("x-ratelimit-remaining") == "0":
        raise RuntimeError("GitHub API rate limit reached. Wait for the limit to reset or configure GITHUB_TOKEN on the server.")
    r.raise_for_status()
    return r.json()


async def _raw(client: httpx.AsyncClient, owner: str, repo: str, branch: str, path: str) -> str | None:
    url = f"{RAW_BASE}/{owner}/{repo}/{branch}/{path}"
    try:
        r = await client.get(url, timeout=20)
        if r.status_code == 200:
            return r.text[:120_000]
    except httpx.HTTPError:
        pass
    return None


async def fetch_repo(client: httpx.AsyncClient, owner: str, repo: str) -> dict:
    data = await _gh(client, f"/repos/{owner}/{repo}")
    return {
        "owner": data["owner"]["login"], "name": data["name"], "fullName": data["full_name"],
        "description": data.get("description") or "No description provided.", "url": data["html_url"],
        "stars": data["stargazers_count"], "forks": data["forks_count"], "watchers": data["watchers_count"],
        "openIssues": data["open_issues_count"], "defaultBranch": data["default_branch"],
        "license": (data.get("license") or {}).get("name"), "createdAt": data["created_at"],
        "updatedAt": data["updated_at"], "homepage": data.get("homepage"), "topics": data.get("topics", []),
        "avatarUrl": data["owner"]["avatar_url"],
    }


async def fetch_languages(client: httpx.AsyncClient, owner: str, repo: str) -> list[dict]:
    data = await _gh(client, f"/repos/{owner}/{repo}/languages")
    total = sum(data.values()) or 1
    return [{"name": k, "bytes": v, "pct": v / total * 100, "color": LANG_COLORS.get(k, "#8b9dc3")} for k, v in sorted(data.items(), key=lambda x: -x[1])]


async def fetch_tree(client: httpx.AsyncClient, owner: str, repo: str, branch: str) -> tuple[dict, list[dict]]:
    data = await _gh(client, f"/repos/{owner}/{repo}/git/trees/{branch}?recursive=1")
    raw_items = [x for x in data.get("tree", []) if x.get("path", "").split("/")[0] not in SKIP_DIRS and x.get("type") in {"blob", "tree"}]
    files = [x for x in raw_items if x["type"] == "blob"]

    root = {"name": repo, "path": "", "type": "dir", "size": 0, "children": []}
    dirs: dict[str, dict] = {"": root}
    # Keep the visible tree manageable while retaining all file metadata separately.
    for item in sorted(raw_items, key=lambda x: x["path"]):
        parts = item["path"].split("/")
        parent = ""
        for i, part in enumerate(parts):
            path = "/".join(parts[: i + 1])
            if path in dirs:
                parent = path
                continue
            is_dir = i < len(parts) - 1 or item["type"] == "tree"
            node = {"name": part, "path": path, "type": "dir" if is_dir else "file", "size": item.get("size", 0)}
            if is_dir:
                node["children"] = []
                dirs[path] = node
            dirs[parent].setdefault("children", []).append(node)
            parent = path
    def trim(node: dict, depth: int = 0) -> dict:
        if node.get("type") != "dir": return node
        children = sorted(node.get("children", []), key=lambda x: (x["type"] != "dir", x["name"]))[:40]
        node["children"] = [trim(c, depth + 1) for c in children] if depth < 3 else []
        return node
    return trim(root), files


def key_files(files: list[dict]) -> list[dict]:
    entry = {"index.ts", "index.js", "index.tsx", "index.jsx", "main.ts", "main.tsx", "main.js", "main.py", "app.py", "manage.py", "server.js", "server.ts", "main.go", "main.rs"}
    configs = ("package.json", "tsconfig.json", "vite.config", "next.config", "tailwind.config", "pyproject.toml", "requirements.txt", "Cargo.toml", "go.mod", "pom.xml", "build.gradle", "Dockerfile", "docker-compose", "schema.prisma")
    docs = ("readme", "contributing", "changelog", "architecture", "license")
    scored = []
    for f in files:
        name = f["path"].split("/")[-1]
        low = name.lower(); score = 0
        if low in entry: score += 100
        if any(x in low for x in configs): score += 80
        if any(x in low for x in docs): score += 60
        if "test" in low or ".spec." in low: score += 55
        if f["path"].count("/") <= 1: score += 15
        scored.append((score, f))
    result = []
    for _, f in sorted(scored, key=lambda x: (-x[0], x[1]["path"]))[:18]:
        name = f["path"].split("/")[-1]; low = name.lower()
        if any(x in low for x in configs): cat = "config"
        elif any(x in low for x in docs): cat = "docs"
        elif "test" in low or ".spec." in low: cat = "test"
        elif low in entry: cat = "entry"
        else: cat = "source"
        result.append({"path": f["path"], "name": name, "summary": f"Evidence-selected key file: {f['path']}", "category": cat})
    return result


MANIFESTS = {"package.json", "requirements.txt", "pyproject.toml", "Cargo.toml", "go.mod", "pom.xml", "build.gradle", "composer.json", "Gemfile"}


def detect_technologies(files: list[dict], contents: dict[str, str], languages: list[dict]) -> list[dict]:
    paths = {f["path"].lower() for f in files}; blob = "\n".join(contents.values()).lower()
    found: dict[str, dict] = {}
    rules = [
        ("React", "Frontend", [r'"react"\s*:'], "package.json"), ("Next.js", "Framework", [r'"next"\s*:'], "package.json"),
        ("Vite", "Build Tool", [r'"vite"\s*:'], "package.json"), ("Tailwind CSS", "Styling", [r'"tailwindcss"\s*:'], "package.json"),
        ("Express", "Backend", [r'"express"\s*:'], "package.json"), ("Prisma", "Database", [r'"@prisma/client"\s*:|"prisma"\s*:'], "package.json"),
        ("FastAPI", "Backend", [r'(^|\n)fastapi([<>=!~]|$)'], "requirements.txt"), ("Django", "Backend", [r'(^|\n)django([<>=!~]|$)'], "requirements.txt"),
        ("Flask", "Backend", [r'(^|\n)flask([<>=!~]|$)'], "requirements.txt"), ("PyTorch", "AI/ML", [r'(^|\n)(torch|pytorch)([<>=!~]|$)'], "requirements.txt"),
        ("TensorFlow", "AI/ML", [r'(^|\n)tensorflow([<>=!~]|$)'], "requirements.txt"), ("Docker", "DevOps", [r"dockerfile", r"docker-compose"], "file tree"),
        ("GitHub Actions", "CI/CD", [r"\.github/workflows/"], "file tree"), ("Jest", "Testing", [r'"jest"\s*:'], "package.json"),
        ("Vitest", "Testing", [r'"vitest"\s*:'], "package.json"),
    ]
    for name, cat, pats, evidence in rules:
        hay = "\n".join(paths) if evidence == "file tree" else blob
        if any(re.search(p, hay, re.I | re.M) for p in pats):
            found[name] = {"name": name, "category": cat, "confidence": 0.96 if evidence != "file tree" else 0.92, "evidence": evidence}
    for lang in languages[:8]:
        found.setdefault(lang["name"], {"name": lang["name"], "category": "Language", "confidence": min(0.99, 0.7 + lang["pct"] / 100), "evidence": f"GitHub language statistics: {lang['pct']:.1f}%"})
    return list(found.values())[:20]


def _module_id(path: str) -> str:
    return re.sub(r"\.(tsx?|jsx?|mjs|cjs|py|go|rs)$", "", path)


def build_dependency_graph(files: list[dict], contents: dict[str, str], technologies: list[dict]) -> dict:
    code_files = [f for f in files if f["path"] in contents and any(f["path"].endswith(x) for x in (".ts", ".tsx", ".js", ".jsx", ".py"))]
    paths = {f["path"] for f in files}; stem_map = {_module_id(p): p for p in paths}
    nodes: dict[str, dict] = {}
    edges: list[dict] = []
    for f in code_files[:120]:
        p = f["path"]; nodes[p] = {"id": p, "label": p.split("/")[-1], "group": "file", "size": min(30, 10 + len(contents[p]) // 2500)}
    tech_nodes = [t["name"] for t in technologies[:12]]
    for t in tech_nodes:
        tid = "tech:" + t; nodes[tid] = {"id": tid, "label": t, "group": "technology", "size": 24}
    edge_seen = set()
    def add(a,b,w=1):
        if a != b and (a,b) not in edge_seen:
            edge_seen.add((a,b)); edges.append({"from": a, "to": b, "weight": w})
    import_re = re.compile(r"(?:import\s+(?:.+?\s+from\s+)?|from\s+)([\"'])(.+?)\1|(?:require\(|import\()[\"'](.+?)[\"']\)")
    for f in code_files[:120]:
        p=f["path"]; text=contents[p]
        for m in import_re.finditer(text):
            target=m.group(2) or m.group(3)
            if not target or not target.startswith("."): continue
            base=os.path.normpath(os.path.join(os.path.dirname(p), target)).replace("\\","/")
            candidates=[base, base+'.ts', base+'.tsx', base+'.js', base+'.jsx', base+'/index.ts', base+'/index.tsx', base+'/index.js']
            hit=next((c for c in candidates if c in paths), None)
            if hit: add(p, hit)
    for f in code_files[:120]:
        p=f["path"]; text=contents[p].lower()
        for t in technologies:
            name=t["name"].lower()
            signatures={"react":["from 'react'", 'from "react"'],"fastapi":["from fastapi","import fastapi"],"express":["from 'express'", 'require(\'express\')'],"prisma":["@prisma/client"],"pytorch":["import torch"],"tensorflow":["import tensorflow"]}.get(name,[])
            if any(s in text for s in signatures): add(p,"tech:"+t["name"],1)
    return {"nodes": list(nodes.values()), "edges": edges[:500]}


def compute_health(meta: dict, files: list[dict], technologies: list[dict], contents: dict[str,str]) -> dict:
    paths={f["path"].lower() for f in files}
    has_readme=any(p.endswith("readme.md") or p.endswith("readme") for p in paths)
    has_tests=any("test" in p or "spec" in p for p in paths)
    has_ci=any(p.startswith(".github/workflows/") for p in paths)
    has_docker=any(p.endswith("dockerfile") or "docker-compose" in p for p in paths)
    has_license=bool(meta.get("license")) or any("license" in p for p in paths)
    recent = meta.get("updatedAt", "")
    try: days=(datetime.now(timezone.utc)-datetime.fromisoformat(recent.replace("Z","+00:00"))).days
    except Exception: days=9999
    activity=100 if days<=30 else 85 if days<=90 else 65 if days<=365 else 40
    doc=(65 if has_readme else 15)+(35 if has_license else 0)
    test=100 if has_tests else 30
    ci=(60 if has_ci else 0)+(40 if has_docker else 0)
    maintain=70
    if any("lock" in p for p in paths): maintain += 15
    if any(p.endswith(("tsconfig.json","pyproject.toml","cargo.toml")) for p in paths): maintain += 15
    breakdown=[
        {"label":"Documentation","score":doc,"weight":0.25}, {"label":"Testing","score":test,"weight":0.20},
        {"label":"CI / DevOps","score":ci,"weight":0.20}, {"label":"Activity","score":activity,"weight":0.20},
        {"label":"Maintainability","score":min(100,maintain),"weight":0.15},
    ]
    score=round(sum(x["score"]*x["weight"] for x in breakdown))
    return {"score": max(0,min(100,score)), "breakdown": breakdown}


def recommendations(meta:dict, files:list[dict], technologies:list[dict]) -> list[dict]:
    paths={f["path"].lower() for f in files}; out=[]
    checks=[
        (not any(p.endswith("readme.md") or p.endswith("readme") for p in paths),"Add or strengthen README","A README is missing from the detected repository tree.","medium","Documentation"),
        (not any("test" in p or "spec" in p for p in paths),"Add automated tests","No obvious test/spec files were detected. Add tests around core modules.","high","Testing"),
        (not any(p.startswith(".github/workflows/") for p in paths),"Add CI checks","No GitHub Actions workflow was detected.","medium","CI/CD"),
        (not any("lock" in p for p in paths if p.endswith((".json",".yaml",".yml"))),"Review dependency locking","A dependency lockfile was not detected in the sampled tree.","low","Dependencies"),
    ]
    for condition,title,detail,severity,category in checks:
        if condition: out.append({"title":title,"detail":detail,"severity":severity,"category":category})
    return out[:6]


def architecture(technologies:list[dict], files:list[dict]) -> dict:
    names={t["name"] for t in technologies}; paths=[f["path"] for f in files]
    layers=[]
    if any(x in names for x in {"React","Next.js","Vue","Svelte"}):
        layers.append({"name":"Presentation","responsibility":"UI, routes and client interactions.","modules":[p for p in paths if any(x in p.lower() for x in ("components/","pages/","app/","views/"))][:6]})
    if any(x in names for x in {"FastAPI","Django","Flask","Express"}):
        layers.append({"name":"API / Backend","responsibility":"HTTP endpoints, business logic and server-side processing.","modules":[p for p in paths if any(x in p.lower() for x in ("server/","api/","routes/","controllers/"))][:6]})
    layers.append({"name":"Configuration & Dependencies","responsibility":"Build configuration, dependency manifests and environment setup.","modules":[p for p in paths if p.split("/")[-1].lower() in MANIFESTS or "config" in p.lower()][:8]})
    return {"pattern":"Layered / evidence-inferred architecture","description":"Architecture is inferred from repository structure, dependency manifests and import relationships; it is not assumed from the project name.","layers":layers}


async def gemini_json(prompt:str) -> dict | None:
    key=os.environ.get("GEMINI_API_KEY")
    if not key: return None
    body={"contents":[{"parts":[{"text":prompt}]}],"generationConfig":{"temperature":0.2,"responseMimeType":"application/json"}}
    try:
        async with httpx.AsyncClient() as client:
            r=await client.post(f"{GEMINI_URL}?key={key}",json=body,timeout=45)
            if r.status_code!=200: return None
            text=r.json()["candidates"][0]["content"]["parts"][0]["text"]
            return json.loads(text)
    except Exception:
        return None


async def analyze_repository(repo_url:str) -> dict:
    owner,repo=parse_repo_url(repo_url)
    async with httpx.AsyncClient(follow_redirects=True) as client:
        meta=await fetch_repo(client,owner,repo)
        languages=await fetch_languages(client,owner,repo)
        tree,files=await fetch_tree(client,owner,repo,meta["defaultBranch"])
        kf=key_files(files)
        important=set(x["path"] for x in kf)
        # Manifests + key source files are fetched from raw GitHub, so the expensive GitHub API is only ~3 calls/analysis.
        wanted=[f["path"] for f in files if f["path"].split("/")[-1] in MANIFESTS or f["path"] in important]
        wanted=[p for p in wanted if any(p.lower().endswith(e) for e in TEXT_EXTENSIONS)][:28]
        contents={}
        for p in wanted:
            text=await _raw(client,owner,repo,meta["defaultBranch"],p)
            if text is not None: contents[p]=text
        tech=detect_technologies(files,contents,languages)
        graph=build_dependency_graph(files,contents,tech)
        health=compute_health(meta,files,tech,contents)
        arch=architecture(tech,files)
        recs=recommendations(meta,files,tech)
        summary=(f"{meta['fullName']} is a {', '.join(t['name'] for t in tech[:5]) or 'software'} project. "
                 f"The repository contains {len(files)} tracked files and is primarily written in {languages[0]['name'] if languages else 'multiple languages'}. "
                 f"CodeTrace identified {len(kf)} key files and {len(graph['edges'])} import/dependency relationships. "
                 f"The inferred architecture is {arch['pattern'].lower()}.")
        ai=await gemini_json(f"""You are CodeTrace AI. Analyze this public GitHub repository using only the supplied evidence. Return JSON with keys summary (4-6 sentences), architecture_description (1-2 sentences), recommendations (array of objects with title,detail,severity,category). Do not invent files or technologies.\nRepository: {meta['fullName']}\nDescription: {meta['description']}\nLanguages: {languages[:6]}\nTechnologies: {tech[:16]}\nKey files: {[x['path'] for x in kf]}\nDependency edges: {graph['edges'][:80]}\nRelevant file snippets: { {k:v[:3500] for k,v in contents.items()} }""")
        if ai:
            summary=ai.get("summary") or summary
            arch["description"]=ai.get("architecture_description") or arch["description"]
            if isinstance(ai.get("recommendations"),list): recs=ai["recommendations"][:6]
        return {"meta":meta,"languages":languages,"keyFiles":kf,"fileTree":tree,"technologies":tech,"dependencyGraph":graph,"summary":summary,"healthScore":health["score"],"healthBreakdown":health["breakdown"],"recommendations":recs,"architecture":arch,"generatedAt":datetime.now(timezone.utc).isoformat()}


async def answer_question(question:str, repo_url:str) -> str:
    owner,repo=parse_repo_url(repo_url)
    # Re-analyze through the same evidence pipeline; Gemini receives compact repository context.
    result=await analyze_repository(repo_url)
    key_paths=[x["path"] for x in result["keyFiles"]]
    prompt=f"""Answer the user's question about GitHub repository {owner}/{repo}. Use only this CodeTrace evidence and say when the evidence is insufficient. Be concise but technical.\nQuestion: {question}\nSummary: {result['summary']}\nArchitecture: {result['architecture']}\nTechnologies: {result['technologies']}\nKey files: {key_paths}\nDependency graph edges: {result['dependencyGraph']['edges'][:120]}"""
    ai=await gemini_json(json.dumps({"question":question,"context":prompt}))
    if ai:
        return ai.get("answer") or ai.get("summary") or "I could not generate an answer from the repository evidence."
    q=question.lower()
    if "entry" in q: return "Likely entry points: " + ", ".join(x["path"] for x in result["keyFiles"] if x["category"]=="entry")
    if "technology" in q or "stack" in q: return "Detected technologies: " + ", ".join(x["name"] for x in result["technologies"])
    if "health" in q: return f"Current evidence-based health score: {result['healthScore']}/100."
    return result["summary"]
