import type { AnalysisResult } from '@/types';

export function parseRepoUrl(input: string): { owner: string; repo: string } | null {
  const value = input.trim().replace(/\/$/, '');
  const full = value.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([^/]+)\/([^/#?]+?)(?:\.git)?(?:[/?#].*)?$/i);
  if (full) return { owner: full[1], repo: full[2] };
  const short = value.match(/^([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/);
  return short ? { owner: short[1], repo: short[2] } : null;
}

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export async function analyzeRepository(repoUrl: string): Promise<AnalysisResult> {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ repo_url: repoUrl }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.detail || `CodeTrace API error (${res.status}).`);
  return body as AnalysisResult;
}

export function getApiBase() { return API_BASE; }
